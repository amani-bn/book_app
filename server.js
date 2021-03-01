'use strict';
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
// const ejs = require('ejs');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');

// localhost:3000/hello
app.get('/hello',(req,res)=>{
res.render('pages/index');
})

// localhost:3000/searches/new
app.get('/searches/new',(req,res)=>{
 res.render('pages/searches/new');
})

app.post('/searches',(req,res) =>{
let searchMethod=req.body.searchbox;
let url;
if (req.body.radioselect === 'Title' ) {
 url = `https://www.googleapis.com/books/v1/volumes?q=${searchMethod}+intitle`;
} else if(req.body.radioselect === 'Author') {
url =`https://www.googleapis.com/books/v1/volumes?q=${searchMethod}+inauthor`;
}
superagent.get (url)
.then (booksResult =>{
// console.log(booksResult.body.items);
let booksArr=booksResult.body.items.map(element => new Book (element));


res.render('pages/searches/show',{mylist:booksArr});
})
//  .catch((errors)=>{
//      app.use("*", (req, res) => {
//          res.status(500).send(errors);
//        })
//    })
})




//Book constructor

function Book(bookData) {
    this.imgUrl =bookData.volumeInfo.imageLinks.thumbnail;
    this.title=bookData.volumeInfo.title || 'no title available for this Book';
    this.authors=bookData.volumeInfo.authors || 'no Author';
    this.description=bookData.volumeInfo.description || 'no description';
}
app.get('/', (req,res) => {
    res.render('pages/index');
})

app.get('/error', (req,res) => {
        res.status(500).send('Error in Route');
           
})
app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})


