## HN 'Who is hiring?' better job board

I'm using SvelteKit to make this app!

It takes all the job posts from the latest monthly HN 'Who is hiring' post, and delivers, I hope, a way better user interface.

## June 21, 2023

Started designing my site in Figma! Still a work in progress. But you can find my scrapbook-like design board live in Figma [here](https://www.figma.com/file/6oFzUK7XW7ZraniN5Yu0so/whoishiring?type=design&node-id=0%3A1&t=o6l0XFyVDSyPRLKu-1)


## June 16, 2023

I've been working on migrating the original stack over to Fly.io. Originally, my setup was: SvelteKit + Supabase DB + Supabase Edge functions. Supabase Edge function was used to schedule a cron job that would ingest data from the HN API and insert it into the DB. However, that quickly filled up the free database egress limit that Supabase had which prompted me to look for alternative solutions. 

After researching and testing out some possible solutions, my new stack is: SvelteKit + Fly.io Postgres + Fly.io Machine. Fly.io's free tier was much more generous and I was also able to deploy and host the site on their platform which was a big plus.

The biggest win is that this setup works great for me and I'll probably continue with it until I need to upgrade or scale it.
You can find the rough version currently at [whoishiring-app.fly.dev](https://whoishiring-app.fly.dev)

## May 18, 2023
We have tags! Now you can filter job posts by popular tags or keywords found across all the posts.

https://github.com/hazzelnut/whoishiring/assets/6500879/3d4123df-e8d2-4826-bec9-184e7ff6a6bf


## April 29, 2023
Here's a sneak peek! It has the basic sort and search functionality and infinite scroll!
The final version will be much more beautiful, I promise.

https://user-images.githubusercontent.com/6500879/235334665-304fd248-45f1-40dd-9753-c747ecfe1c1c.mp4

# Deploying to Fly.io

1. Install flyctl and login, see [here](https://fly.io/docs/hands-on/install-flyctl/)
2. Update your adapter in svelte.config.js to use `adapter-node`, see [here](https://kit.svelte.dev/docs/adapter-node)
3. Add a start script in your package.json. 
  ```js
    // Have environment variables you need need in production? Run 'npm install dotenv'
		"start": "node -r dotenv/config build"
    // Or, if you don't need environment variables
		"start": "node build"
  ```
4. Run `fly launch`. It will guide you through the process of deploying your app.
5. Done! Navigate to your new site at `<name_of_app>.fly.dev`