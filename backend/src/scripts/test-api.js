const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

console.log(`Starting SmartPrice API integration tests against ${BASE_URL}...`);

// Helper for HTTP requests
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    let token = '';
    let testProductId = '';

    // Test 1: Verify server is running
    console.log('\n[Test 1] GET / (Root Health Check)');
    const health = await request('GET', '/');
    console.log(`Status: ${health.status}`);
    console.log(`Response:`, health.body);
    if (health.status !== 200) throw new Error('Health check failed');

    // Test 2: Login
    console.log('\n[Test 2] POST /auth/login (Owner Login)');
    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@smartprice.com',
      password: 'Password123'
    });
    console.log(`Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
      console.error(loginRes.body);
      throw new Error('Owner login failed');
    }
    console.log('Login successful! Role:', loginRes.body.user.role);
    token = loginRes.body.token;

    // Test 3: Get all products
    console.log('\n[Test 3] GET /products (Fetch Catalog)');
    const getProdRes = await request('GET', '/products');
    console.log(`Status: ${getProdRes.status}`);
    console.log(`Seeded count: ${getProdRes.body.count}`);
    if (getProdRes.status !== 200) throw new Error('Fetch products failed');

    // Test 4: Search products
    console.log('\n[Test 4] GET /products/search?q=Roma (Search)');
    const searchRes = await request('GET', '/products/search?q=Roma');
    console.log(`Status: ${searchRes.status}`);
    console.log(`Found count: ${searchRes.body.count}`);
    console.log(`Sample:`, searchRes.body.data[0]?.productName);
    if (searchRes.status !== 200) throw new Error('Search products failed');

    // Test 5: Unauthorized product creation
    console.log('\n[Test 5] POST /products (Create Product - No Auth)');
    const createUnauthRes = await request('POST', '/products', {
      productName: 'Unauth Cable',
      productCode: 'UA-CABLE',
      category: 'Wires',
      brand: 'None',
      price: 100
    });
    console.log(`Status: ${createUnauthRes.status} (Expected: 401)`);
    if (createUnauthRes.status !== 401) throw new Error('Allowed unauthorized write!');

    // Test 6: Authorized product creation
    console.log('\n[Test 6] POST /products (Create Product - Authorized)');
    const createAuthRes = await request('POST', '/products', {
      productName: 'Finolex 3 Core Flat Cable 1.5mm',
      productCode: 'FX-3C15-100',
      barcode: '8903567253999',
      category: 'Wires & Cables',
      brand: 'Finolex',
      price: 6500
    }, {
      'Authorization': `Bearer ${token}`
    });
    console.log(`Status: ${createAuthRes.status}`);
    if (createAuthRes.status !== 201) {
      console.error(createAuthRes.body);
      throw new Error('Authorized creation failed');
    }
    testProductId = createAuthRes.body.data._id;
    console.log(`Created product ID: ${testProductId}`);

    // Test 7: Update product price
    console.log('\n[Test 7] PUT /products/:id (Update Product Price)');
    const updateRes = await request('PUT', `/products/${testProductId}`, {
      price: 6850
    }, {
      'Authorization': `Bearer ${token}`
    });
    console.log(`Status: ${updateRes.status}`);
    console.log(`Updated price: ${updateRes.body.data.price}`);
    if (updateRes.status !== 200 || updateRes.body.data.price !== 6850) {
      throw new Error('Product update failed');
    }

    // Test 8: Delete product
    console.log('\n[Test 8] DELETE /products/:id (Delete Product)');
    const deleteRes = await request('DELETE', `/products/${testProductId}`, null, {
      'Authorization': `Bearer ${token}`
    });
    console.log(`Status: ${deleteRes.status}`);
    if (deleteRes.status !== 200) throw new Error('Product deletion failed');

    console.log('\n======================================');
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================');
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTests();
