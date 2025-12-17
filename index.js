import express from "express";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "data", "posts.json");

function loadPosts() {
    try {
        const data = fs.readFileSync(dataFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function savePosts(posts) {
    fs.writeFileSync(dataFile, JSON.stringify(posts, null, 2));
}

//middleware
app.use(express.urlencoded({extended: true}));  
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let posts = loadPosts();

//home
app.get("/", (req, res) => {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    let filteredPosts = posts;

    if (q) {
        filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(q.toLowerCase()) ||
            post.content.toLowerCase().includes(q.toLowerCase())
        );
    }

    //paginate
    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil( totalPosts / limit );

    const startIndex = (page - 1) * limit;
    const endindex = page * limit;

    const paginationPosts = filteredPosts.slice(startIndex, endindex);

    res.render("index", {
        posts: paginationPosts,
        q,
        currentPage: page,
        totalPages
    });
});

//new
app.get("/new", (req, res) => {
    res.render("new");
})

//create
app.post("/posts", (req, res) => {
    const { title, content } = req.body;

    const newPost = {
        id: Date.now().toString(),
        title,
        content
    };

    posts.push(newPost);
    savePosts(posts);
    res.redirect("/");
});

// edit form
app.get("/posts/:id/edit", (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found.");
    }

    res.render("edit", { post });
});

//detail
app.get("/posts/:id", (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found.");
    }

    res.render("detail", { post });
});

//update
app.post("/posts/:id/edit", (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found.")
    };

    post.title = title;
    post.content = content;

    savePosts(posts);
    res.redirect("/");
});

//delete
app.post("/posts/:id/delete", (req, res) => {
    const { id } = req.params;

    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).send("Post not found");
    };

    posts.splice(index, 1);
    savePosts(posts);

    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});