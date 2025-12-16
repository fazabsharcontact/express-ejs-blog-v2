import express from "express";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

//middleware
app.use(express.urlencoded({extended: true}));  
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let posts = [];

app.get("/", (req, res) => {
    res.render("index", { posts });
});

app.get("/new", (req, res) => {
    res.render("new");
})

app.post("/posts", (req, res) => {
    const { title, content } = req.body;

    const newPost = {
        id: Date.now().toString(),
        title,
        content
    };

    posts.push(newPost);
    res.redirect("/");
});

app.get("/posts/:id/edit", (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found.");
    }

    res.render("edit", { post });
});

app.post("/posts/:id/edit", (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found.")
    };

    post.title = title;
    post.content = content;

    res.redirect("/");

    console.log(req.body);
});

app.post("/posts/:id/delete", (req, res) => {
    const { id } = req.params;

    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).send("Post not found");
    };

    posts.splice(index, 1);
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});