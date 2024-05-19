import express from "express";

const app = express();
const port = 9000;

app.use("/", (req, res) => {
    res.json({ message : "Server is working" });
})

app.listen(port, () => {
    console.log(`Starting server on Port ${port}`);
});