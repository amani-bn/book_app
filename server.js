'use strict';
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
// const ejs = require('ejs');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');

// localhost:3000/hello
// app.get('/hello',(req,res)=>{
// res.render('pages/index');
// })

app.get('/', (req,res) => {
    let SQL=`SELECT * FROM books;`;
    client.query(SQL)
    .then(result =>{
        // console.log(result.rows);

        res.render('pages/index',{booklist:result.rows});
    
})
})

app.get('/books/:id',(req,res) => {

    let SQL = `SELECT * from books WHERE id=$1;`;
    let value = [req.params.id];
  client.query(SQL,value)
  .then(result=>{
    console.log(result.rows);
    res.render('pages/books/detail',{task:result.rows[0]})
  })

})
app.post('/addBook',(req,res) =>{
let SQL = `INSERT INTO books(author,title,isbn,image_url,description) VALUES ($1,$2,$3,$4,$5)RETURNING id;`;
  let value = req.body;
  let safeValues= [value.author,value.title,value.isbn,value.image_url,value.description];
  client.query(SQL,safeValues)
  .then((result)=>{
    console.log(result.rows);
    res.redirect(`../show/${result.rows[0].id}`);
  })
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



app.get('/error', (req,res) => {
        res.status(500).send('Error in Route');
           
})
client.connect()
.then (() =>{
app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})
})


