import { exhibitors, embeddings } from '@/lib/drizzle/schema';
import { mistral } from '@ai-sdk/mistral';
import { embedMany, streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/drizzle/db';
import { cosineDistance, desc, gt, sql, ilike, and, SQL } from 'drizzle-orm';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: mistral('mistral-large-latest'),
    system: `You are a helpful assistant for the GITEX AFRICA event. Your role is to help users find information about exhibitors, their products, and sectors.
    
    - When users ask about exhibitors or companies:
    1. ALWAYS use the searchExhibitors tool to find relevant information
    2. After getting the results, format them into a clear, readable response
    3. summarize the results in a few sentences, example don't list all the products and services, just summarize the main ones
    4. summarize the description of the exhibitors make it consice max 2-4 sentences, don't just repeat it.
    5. if the user specifies a country or hall number make sure to use it in the filters in the searchExhibitors tool
    6. for the query, you can always use the user's query as a base and add more details to it, so the search is more accurate and can return more relevant results.
    
    - When the user includes a pdf file (user cv), analyze it and use the information to form a query to search for exhibitors that match the user's education, experience, skills, etc. form a the query in natural language make it as detailed as possible.

    - When users ask for more results or "suggest more":
    1. Keep track of how many exhibitors you've already shown
    2. Use the SAME search query but add a skip parameter equal to the number of exhibitors already shown
    3. Make it clear that you're showing additional results for their previous query
    


    Format your responses in markdown:
    - Use "**Company Name**" for company names
    - Include "🏢 Stand: {number}" if available
    - Include "🌍 Country: {country}" if available
    - If products exist, list them under "🛠️ Products:"
    - If social links exist, list them under "🔗 Social Links:"
    - Use proper line breaks between sections
    - Start with a brief intro summarizing the number of relevant exhibitors found
    - Use a divider line to separate each exhibitor
    - if you you used the country or hall filter, and you didn't find any exhibitors, you can always retry calling the tool without those filters, but make sure to mention that you did that
    
    Example format:
    I found {N} exhibitors matching your query:

    ##### **Company Name**\n
    🏢 Stand: H7-B25\n
    🌍 Country: United Arab Emirates\n

    {Description if available}
    
    🛠️ Products:
    - Product 1 (Category)
    - Product 2 (Category)
    
    🔗 Social Links:
    - Website: {url}
    - LinkedIn: {url}

    If no exhibitors are found, respond: "I apologize, but I couldn't find any exhibitors matching your query. Could you please try rephrasing or provide more specific information about what you're looking for?"`,
    messages,
    maxSteps: 4,
    tools: {
      searchExhibitors: tool({
        description: 'Search for exhibitors using semantic similarity',
        parameters: z.object({
          query: z.string().describe('The search query to find relevant exhibitors'),
          country: z.string().optional().describe('Filter by country in full format (in english)'),
          hall: z.number().optional().describe('Filter by hall number'),
          skip: z
            .number()
            .optional()
            .describe(
              'Number of records to skip for pagination (use when user asks for more results)'
            ),
        }),
        execute: async ({ query, country, hall, skip = 0 }) => {
          console.log(
            '🌐 Searching exhibitors with ',
            'query:',
            query,
            'country:',
            country,
            'hall:',
            hall,
            'skip:',
            skip
          );
          const exhibitors = await searchExhibitors(query, { country, hall, skip });
          return exhibitors;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}

const model = mistral.embedding('mistral-embed');

async function searchExhibitors(
  query: string,
  filters: {
    country?: string;
    hall?: number;
    skip?: number;
  } = {}
) {
  try {
    const { embeddings: queryEmbeddings } = await embedMany({
      model,
      values: [query],
    });

    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryEmbeddings[0])})`;

    const conditions: SQL[] = [gt(similarity, 0.5)];

    if (filters.country) {
      conditions.push(ilike(exhibitors.country, `%${filters.country}%`));
    }

    if (filters.hall) {
      conditions.push(
        sql`(${exhibitors.stand_number} ~* ${`Hall\\s*${filters.hall}(\\b|$)`} OR ${exhibitors.stand_number} LIKE ${`%Hall ${filters.hall}%`})`
      );
      console.log(`🔍 Filtering stands for Hall ${filters.hall}`);
    }

    const skip = filters.skip || 0;

    const similarExhibitors = await db
      .select({
        id: exhibitors.id,
        name: exhibitors.name,
        description: exhibitors.description,
        stand_number: exhibitors.stand_number,
        country: exhibitors.country,
        products: exhibitors.products,
        social_links: exhibitors.social_links,
        similarity,
      })
      .from(exhibitors)
      .innerJoin(embeddings, sql`${exhibitors.id} = ${embeddings.exhibitor_id}`)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(similarity))
      .limit(5)
      .offset(skip);

    console.log(`🔍 Query returned ${similarExhibitors.length} results`);

    return similarExhibitors.map(exhibitor => ({
      ...exhibitor,
      products: exhibitor.products ?? [],
      social_links: exhibitor.social_links ?? {},
    }));
  } catch (error) {
    console.error('Error searching exhibitors:', error);
    throw new Error('Failed to search exhibitors');
  }
}
