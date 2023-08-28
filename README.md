## HN 'Who is hiring?' better job board

Tech stack: SvelteKit, DrizzleORM, Fly.io (PostgresDB and Hosting), and vanilla CSS 🍦

It takes all the job posts from the latest monthly HN 'Who is hiring' post, and delivers, I hope, a way better user interface.

Site is currently live: [whoishiring-app.fly.dev](https://whoishiring-app.fly.dev).

## August 28, 2023

Added some meta tags for previews, title changes, and a favicon! It's pretty much done for now. Version 1.0 finished 🎉!

https://github.com/hazzelnut/whoishiring/assets/6500879/24c4a653-67af-4dcb-af57-60c4530bf48c

## August 27, 2023

So I did three things.

First, I did a makeover treatment for the site - colours and fonts included.

Before I had boring brown. It's not a colour I would usually use for UI, but I thought why not give it a try? The colour wasn't terrible, but I slowly grew tired of it. It wasn't ... exciting? The more I looked at it, the less excited I was to use my own app 😅. I guess colours can do that to a person.

Around the same time, I remembered distinctly the colours of one website I visited. Inflection.ai's. They were neutral but inviting. It was a feeling I wanted for my own app, because jobs searching can be an emotional rollercoaster ride. And I'm tired of corporate greys and blues.

I'm fairly confident colours aren't trademarked so ... I <strike>copied</strike> stole their colours and tweaked it to my liking. Thanks Inflection! I ended up using the colours in the circled blue.

<img width="317" alt="new-colours-new-me" src="https://github.com/hazzelnut/whoishiring/assets/6500879/3009b141-0d86-4e3e-ae6b-c71a1158bdbe">

Second, I added a placeholder loading animation for popular filters. Before it was just a bare, empty space. Now you get to see some shimmering green!

https://github.com/hazzelnut/whoishiring/assets/6500879/6335dd15-b1ac-4e98-a7e3-84451537d35f

Third, and lastly, I modified the layout for the other filters (newest/oldest, remote, saved). I think they look nicer?

https://github.com/hazzelnut/whoishiring/assets/6500879/a7ee4bef-9c0e-47d9-be32-2e9dd8cf5a0e


## August 22, 2023

Styling the search bar, the filters, and making the site responsive 😎

https://github.com/hazzelnut/whoishiring/assets/6500879/03f59cbb-8204-4775-92df-3ed667a07131

## August 19, 2023

Time to style the list of filters so they look extra nice 💅.

https://github.com/hazzelnut/whoishiring/assets/6500879/04ffbb28-5f87-4db2-b72e-c00dae604d2a

## August 17, 2023
Ahhh... sometimes starting a project is easy. But finishing it is the hardest.

I've been on/off on this project. Life work gets in the way sometimes :/

Thankfully, there's no real consequence on not completing this project on time ... aside from it affecting my own temperament 😅.

For the most part, the logic is all finished. Right now it is about adding styles. Making the UI look pretty!

I debated back and forth with using some UI framework. Mostly because I was feeling too lazy to implement the styles and logic associated with interactions. shadcn/ui was a contender. It's what all the cool kids are using nowadays. But, my designs aren't that complex. And CSS is relatively easy to write. Plus, my app will be ... less bloated? I guess that's cooler 😎

So vanilla CSS and SVGs icons from scratch here we go...


First, I decided to export my icon designs in Figma into SVGs. They looked relatively simple so why not?

<img width="737" alt="icon-svgs" src="https://github.com/hazzelnut/whoishiring/assets/6500879/e6cc2010-576c-4c86-acb5-0ff76db1a59a">

Next, I combined the SVG icons with some buttons, wrote some logic and CSS and here's what we it looks like!


https://github.com/hazzelnut/whoishiring/assets/6500879/934ad364-89e1-4d57-8088-439fdf8bdd8b



## July 30, 2023

No graphic here but I added Plausible Analytics to my app. It's a privacy-friendly analytics tracker. Plus, it's open-source. I decided to give their free trial a try to see if it works well with my app. And if I want to use it for future apps that I build. We'll see!

## July 23, 2023

Implementing the 'save' feature was a bit tricky. Why? Here are few things I wanted to get right: 
- The 'saved' jobs should persist in the browser; if the user navigates away and comes back later, it will still be there.
- When 'un-saving' jobs in a 'show saved jobs' mode, the results should update accordingly

Persisting saved jobs meant storing it in the browser. Cookies? No. I opted for localStorage instead becaues I'm reading the data client-side only and there's no expiry date with localStorage. I implemented this part using Svelte store. Using stores took a little while to understand, but it's mostly straightforward after that.

Updating the number of results when 'un-saving' jobs in 'show saved jobs' mode was trickier. I still wanted the most up-to-date URL reflecting the results I'm getting when 'un-saving' jobs because I can copy-paste it and share it with others later. Implementing this part meant including the post components inside the `<form>`. I'm not sure if this is the best implementation, because a slow connections can make 'un-saving' jobs slow, but we will see!

Here's a short vid to summarize what you can do with saving now. Also notice the URL changing when 'un-saving' jobs.

https://github.com/hazzelnut/whoishiring/assets/6500879/59b8bdd6-c90a-477f-a85c-2f4c9dc02dcf


## July 11, 2023

Took a little break, but I got back into desiging the mobile version of the site. Had to resize a few buttons and font sizes to fit all the content. This means I'll probably have to code these constraints in CSS to adapt to a smaller screen. I used an iPhone 13 mini frame size as a reference to constrain my design choices to a smaller screen. But it's also the phone I have and I often find other sites not very well designed for it. So why not make my site work for my phone?

<img width="224" alt="mobile design" src="https://github.com/hazzelnut/whoishiring/assets/6500879/3aaf8e7a-ceed-445d-9baa-52708f4e1d22">


## June 23, 2023

Cleaned up the design a bit more. Going to start off with some basic features and getting them to work really well before I add others. Some features I had in mind: Checking off posts as applied, a copy button to copy text of posts or all the posts, highlight the searched term or tagged term in the post itself, etc.

<img width="906" alt="design step 2" src="https://github.com/hazzelnut/whoishiring/assets/6500879/2c55ed43-2074-470c-9c82-c168f498ddd4">


## June 21, 2023

Started designing my site in Figma! Still a work in progress. You can find my scrapbook-like design board live in Figma [here](https://www.figma.com/file/6oFzUK7XW7ZraniN5Yu0so/whoishiring?type=design&node-id=0%3A1&t=o6l0XFyVDSyPRLKu-1).

<img width="787" alt="design" src="https://github.com/hazzelnut/whoishiring/assets/6500879/4c387844-cb8a-47f6-af55-ff28ee534e80">

## June 16, 2023

I've been working on migrating the original stack over to Fly.io. Originally, my setup was: SvelteKit + Supabase DB (and its DB API) + Supabase Edge functions. Everything worked great and the MVP was finished. But, there was one problem.

The Supabase edge function was triggered by a cron job every 5 minutes, and the edge function would fetch data from the HN API and insert it into the DB. After a few days, I checked on my usages and found that I had exceeded my free database egress limit! That prompted me to look for alternative solutions. And oddly, the database usage bar was also slowly increasing even though I was only updating rows at the time and not adding more to the table. I wish I had a screenshot to show the bright red warnings, but it was clear that using Supabase wasn't viable going forward (for freeness sake).

After researching and testing out other possible solutions, my new stack became: SvelteKit + Drizzle ORM + Fly.io Postgres + Fly.io Machine. Fly.io's free tier was much more generous and I was also able to deploy and host the site on their platform too which was a big plus.

The biggest win is for me is that I can support all the functionality for free without running into limits (yet!). 

You can find the rough version currently at [whoishiring-app.fly.dev](https://whoishiring-app.fly.dev)

My simple fly.io setup:
<img width="1009" alt="fly io setup" src="https://github.com/hazzelnut/whoishiring/assets/6500879/bdf19580-226e-4adb-abd8-2f57787bdc98">


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
