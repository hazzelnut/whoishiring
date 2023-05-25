# Scheduling Supabase Edge Function to ingest HN jobs to Supabase


You can follow these quickstart instructions at Supabase: https://supabase.com/docs/guides/functions/quickstart#create-an-edge-function

Most of the work involves installing the Supabase CLI and configuring it to your project. Later you can use the CLI to create a function, deploy it, and run it locally or remotely.

But, if I were to recall what I did here's roughly the instructions I would give to myself.

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
supabase link --project-ref your-project-ref
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

### 7. Enable postgres extensions: pg_net and pg_cron

I'm using postgres extensions provided by Supabase to schedule a cron job to call our edge function.

There's a few things we need to do. First we need to enable these extension. Navigate to the 'Database' page, find pg_cron and pg_net and toggle the button to enable them.

Afterwards, we'll go to the 'SQL Editor' page to enable them in our DB. Yes, that's right. We're writing some SQL, but it should be pretty simple.

```sql
-- enable the "pg_cron" extension
create extension pg_cron with schema extensions;

-- enable the "pg_net" extension.
create extension pg_net;
```


### 8. Execute SQL to schedule a cron job

While we're in the 'SQL Editor', we'll run this SQL statement to schedule our cron job that calls our edge function via a RESTful POST call.

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

To double-check if the SQL commands 

### 8. Test it out

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


