import express from "express";
import corse from 'cors';
import fs from 'fs';
import { JSDOM } from "jsdom";

const app = express();
app.use(corse({
    origin: '*'
}));

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
    // console.log(req);
    // const departmentsURL = 'https://oibs2.metu.edu.tr/View_Program_Course_Details_64/main.php';
    // const departments = await sendRequest(departmentsURL);
    // const dom = new JSDOM(departments, { url: departmentsURL });
    // const { document } = dom.window;
    // const options = Array.from(document.querySelectorAll('option'));
    // const filteredOptions = options.filter(option => {
    //     if (option.text.includes('Spring') || option.text.includes('Fall') || option.text.includes('Summer School')) {
    //         return false;
    //     }
    //     return true;
    // });
    // const simplifiedOptions = filteredOptions.map(option => {
    //     return {
    //         value: option.value,
    //         text: option.text
    //     }
    // });
    // const optionsJSON = {
    //     result: simplifiedOptions
    // }
    // res.json(optionsJSON);
    // res.json({
    //     result: []
    // });

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