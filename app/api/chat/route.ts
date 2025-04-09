import { exhibitors, embeddings } from '@/lib/drizzle/schema';
import { mistral } from '@ai-sdk/mistral';
import { embedMany, streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/drizzle/db';
import { cosineDistance, desc, gt, sql, ilike, and, SQL } from 'drizzle-orm';

export const maxDuration = 240;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: mistral('mistral-large-latest'),
    system: `You are a helpful assistant for the GITEX exhibition. Your role is to help users find information about exhibitors, their products, and sectors.
    
    When users ask about exhibitors or companies:
    1. ALWAYS use the searchExhibitors tool to find relevant information
    2. After getting the results, format them into a clear, readable response
    3. summarize the results in a few sentences, for the descriptions for example don't list all the products and services, just summarize the main ones
    5. if the user specifies a country make sure to use it in the filters in the searchExhibitors tool
    6. for the query, you can always use the user's query as a base and add more details to it, so the search is more accurate and can return more relevant results.
    
    Format your responses in markdown:
    - Use "**Company Name**" for company names
    - Include "🏢 Stand: {number}" if available
    - Include "🌍 Country: {country}" if available
    - If products exist, list them under "🛠️ Products:"
    - If social links exist, list them under "🔗 Social Links:"
    - Use proper line breaks between sections
    - Start with a brief intro summarizing the number of relevant exhibitors found
    - Use a divider line to separate each exhibitor
    - if you you used the country filter, and you didn't find any exhibitors, you can always retry calling the tool without the country filter, but make sure to mention that you did that
    Example format:
    I found {N} exhibitors matching your query:

    **Company Name**
    🏢 Stand: H7-B25
    🌍 Country: United Arab Emirates
    
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
        }),
        execute: async ({ query, country }) => {
          console.log('🌐 Searching exhibitors with country:', country);
          const exhibitors = await searchExhibitors(query, { country });
          return exhibitors;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}

const model = mistral.embedding('mistral-embed');

async function searchExhibitors(query: string, filters: { country?: string } = {}) {
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
      .limit(5);

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
