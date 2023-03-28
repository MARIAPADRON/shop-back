const request  = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
require('../models/index');

let cartId;
let token;

beforeAll(async() => {
    const credentials = {
        email: "test@gmail.com",
        password: "1234"
    }
    const res = await request(app)
    .post('/users/login')
    .send(credentials);
    token = res.body.token;
})

test('POST /carts should create one cart', async() =>{
    const products = await Product.create({ 
        title: "tv",
        description: "pantalla 100'plana",
        price: 1000
})
    const cart =  {
        quantity: 2,
        productId: products.id
    }  
    const res = await request(app)
    .post('/carts')
    .send(cart)
    .set('Authorization', `Bearer ${token}`);
    await products.destroy();
    cartId = res.body.id;
    expect(res.statusCode).toBe(201);
    expect(res.body.quantity).toBe(cart.quantity);
})

test('GET /carts should return all carts', async() =>{
    const res = await request(app)
    .get('/carts')
    .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
})

test('PUT /carts/:id should update one cart', async() => {
    const body = {
        quantity: 2 
    }
    const res = await request(app)
    .put(`/carts/${cartId}`)
    .send(body)
    .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(body.quantity);
})

test('DELETE /carts/:id should delete one cart', async() => {
    const res = await request(app)
    .delete(`/carts/${cartId}`)
    .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
})