import express from "express";
import corse from 'cors';
import compression from "compression";
import fs from 'fs';

const app = express();
app.use(corse({
    origin: '*'
}));

app.use(compression());

app.get('/departments', async (req, res) => {
    fs.readFile('departments.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log('file read');
        res.send(data);
    });
});

app.get('/courses', async (req, res) => {
    fs.readFile('courses.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log('file read');
        res.send(data);
    });

});


app.listen(5001, () => {
    console.log('Server is running on port 5001');
});