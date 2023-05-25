# Generating types with Supabase CLI 

Once you've linked your project: 

```bash
supabase link --project-ref <project_ref>
```

You can generate the types with this command:

```bash
supabase gen types typescript --linked --schema public > src/lib/supabase/schema.ts
```
You can substitute `src/lib/supabase/schema.ts` with whatever path and file you desire. I placed mine in the same folder as `/supabase`.

# Scheduling DB migrations with Supabase CLI

Migrations in Supabase require a bit more work. You'll have to write some raw SQL for your migrations.

To generate a migration:
```bash
supabase migration new <name_of_migration>
```
A file will be create in `./supabase/migrations/<timestamp>_<name_of_migration>.sql`

Once you've written some SQL in `<name_of_migration>.sql` file, you can deploy your migration changes to your DB.

```bash
supabase db push
```

And you're done!

Afterwards, I usually go to Supabase.com and look at my tables to see if the migration worked.

# Scheduling Supabase Edge Function to ingest HN jobs to Supabase

You can follow these quickstart instructions at Supabase: https://supabase.com/docs/guides/functions/quickstart#create-an-edge-function to get an idea of how to set up an edge function and schedule it to run.

Most of the work involves installing the Supabase CLI and configuring it to your project. Later, you can use the CLI to create a function, deploy it, and run it locally or remotely.

If I were to recall what I did, here's roughly the instructions I would give to myself.

### 1. Install the Supabase CLI

You can follow the instructions [here](https://supabase.com/docs/guides/cli), or if you're on MacOS:

```bash
npm install supabase --save-dev
# or with brew
brew install supabase/tap/supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Initialize Supabase to generate files locally
```bash
supabase init
```

### 4. Link to my remote project

You can find your project ref inside the project settings page > General > Reference ID

```bash
supabase link --project-ref <project_ref>
```

### 5. Create the files for the function via CLI

You can skip this step if you're using the existing edge function code in this repo. eg. `supabase/functions/cron-tab-fetch/index.ts`

```bash
supabase functions new ingest-data 
```

### 6. Deploy the function to your project
```bash
supabase functions deploy ingest-data
```

### 7. Test out the Edge Function

At this point, I would test the function by calling it in the terminal or in the 'Edge Function' page in Supabase.com.

```bash
# To invoke using httpie:
http -A bearer -a {ANON_API_KEY} https://<project_ref>.functions.supabase.co/cron-job-fetcher

# Or if you use cURL
curl --request POST 'https://<project_ref>.functions.supabase.co/cron-job-fetcher' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "name":"Functions" }'
```

Afterwards, I would check the logs tab inside the 'Edge Functions' page to see if any invocations happened.

### 8. Enable postgres extensions: pg_net and pg_cron

I'm using postgres extensions provided by Supabase to schedule a cron job to call our edge function.

There's a few things we need to do. First we need to enable these extension. Navigate to the 'Database' page, find pg_cron and pg_net and toggle the button to enable them.

Afterwards, we'll go to the 'SQL Editor' page to enable them in our DB. Yes, that's right. We're writing some SQL, but it should be pretty simple.

```sql
-- enable the "pg_cron" extension
create extension pg_cron with schema extensions;

-- enable the "pg_net" extension.
create extension pg_net;
```

### 9. Execute SQL to schedule a cron job

While we're in the 'SQL Editor', we'll run this SQL statement to schedule our cron job that calls our edge function via a POST call.

```sql
select
  cron.schedule(
    'ingest-data-every-5-min',
    '*/5 * * * *', -- every 5 min
    $$
    select
      net.http_post(
          url:='https://<project_ref>.functions.supabase.co/cron-job-fetcher',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <ANON_API_TOKEN>"}'::jsonb
      ) as request_id;
    $$
  );

```

To double-check if the cron job is running, go to Supabase.come and navigate to the 'Table Editor' > 'Schema' cron > 'job_run_details' table. There should be some rows inserted after there after the initial 5 (or however many minutes) minutes have passed.

### 10. Sit back and enjoy!

At this point, everything should running itself. Sometimes I'll monitor the logs in the 'Edge Functions' page for errors or my usage under the 'Project Settings' page to make sure I'm not ingesting data like crazy.


