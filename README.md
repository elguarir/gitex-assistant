# GITEX Assistant

This application provides assistive information about GITEX exhibitors, allowing users to search by natural language queries and get relevant exhibitors.

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [Drizzle ORM](https://orm.drizzle.team/) - SQL ORM for TypeScript
- [PostgreSQL](https://www.postgresql.org/) with pgvector extension for vector embeddings
- [HeroUI v2](https://heroui.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Mistral AI](https://mistral.ai/) for embeddings

## Features

- **Natural Language Search:** Find exhibitors using conversational queries.
- **Semantic Search:** Leverages Mistral AI embeddings and PostgreSQL `pgvector` to find exhibitors based on profile similarity.
- **Filtering:** Refine search results by country and hall number.
- **Interactive Chat UI:** Built with Next.js AI SDK for a responsive user experience.
- **File Upload:** Ability to upload pdf documents (resumes, brochures, etc.) and get relevant exhibitors.

## Planned Features

- **Exhibitor Deep Dive:** Engage in detailed discussions about specific exhibitors, including their products, services, and market positioning.
- **Contact Information Retrieval:** Implement an AI agent that can retrieve search and deep dive into a certain exhibitor's socials to get their contact information.
- **Conversation Planning:** AI-assisted brainstorming for potential talking points and conversation starters tailored to each exhibitor's profile.

## Database Structure

The application uses PostgreSQL with the following schema:

- **Exhibitors**: Contains information about GITEX exhibitors
- **Sectors**: Industry sectors with hierarchical parent-child relationships
- **ExhibitorSectors**: Many-to-many relationship between exhibitors and sectors
- **Embeddings**: Vector embeddings for exhibitor information to enable semantic search

## Data Migration

To migrate data from JSON files to the database:

1. Set up your environment variables in `.env` (see `.env.example`)
2. Run the database migrations: `bun run db:migrate`
3. To migrate exhibitor and sector data: `bun run db:migrate-data`

### Data Files

- `data/gitex_exhibitors.json`: Contains basic exhibitor information including company name, booth, and contact details
- `data/gitex_sectors_flat.json`: Contains sector data with hierarchical relationships
- `data/exhibitor_profiles_full.json`: Contains detailed exhibitor profiles including descriptions and product information

## Scripts

- `db:generate`: Generate Drizzle migration files from schema changes
- `db:migrate`: Apply database migrations
- `db:migrate-data`: Import exhibitor and sector data from JSON files
- `db:generate-embeddings`: Generate and store embeddings for exhibitors
- `db:studio`: Launch Drizzle Studio to explore and modify database content
- `dev`: Start the development server
- `build`: Build the application for production
- `start`: Run the production build

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```
