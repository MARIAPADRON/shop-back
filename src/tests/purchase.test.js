const request  = require('supertest');
const app = require('../app');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
require('../models/index');

let userId;
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
    userId = res.body.user.id;
})

test('POST /purchases should create one purchase', async() =>{
    const product = await Product.create({ 
        title: "tv",
        description: "pantalla 100'plana",
        price: 1000
    });
    await Cart.bulkCreate([
        {
            quantity: 1,
            productId: product.id,
            userId
        }
    ])
    
       
    let cart = await Cart.findAll({
        attributes: ['quantity', 'userId', 'productId'],
        raw:true
    });
    const res = await request(app)
    .post('/purchases')
    .send(cart)
    .set('Authorization', `Bearer ${token}`);

    await product.destroy();
    await Cart.destroy({ where: { userId } });
    cart = await Cart.findAll();
    expect(res.status).toBe(200);
    expect(cart).toHaveLength(0)
})
test('GET /purchases should return all purchases', async() =>{
    const res = await request(app)
    .get('/purchases')
    .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
})