## HN 'Who is hiring?' better job board

I'm using SvelteKit to make this app!

It takes all the job posts from the latest monthly HN 'Who is hiring' post, and delivers, I hope, a way better user interface.


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