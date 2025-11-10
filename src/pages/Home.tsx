import Chatbot1 from '../components/Chatbot1'
// import { API_URL } from '../constants/API'  // <-- import the base URL
const API_URL = 'http://localhost:3001/api'

const Home = () => {
  return (
    <div className='h-screen w-full'>
      <div className='max-w-[980px] mx-auto h-screen relative'>
        <Chatbot1
          type='first'
          apiSchema={[
            {
              name: 'Random products',
              description: 'API for fetching random products',
              method: 'GET',
              url: `${API_URL}/products/random`,
            },
            {
              name:'Orders',
              description:"API for fetching buyer orders",
              method:'GET',
              url:`${API_URL}/orders/all`
            },
            {
name:'Order details',
description:"Get the order details",
method:'GET',
url:`${API_URL}/orders/order/{order_id}`,
parameters:{
  path:['order_id'],
  instructions:"Append order id from conversations after endpoint orders/order"
}
            },
            {
              name: 'Product details',
              description: 'API for fetching product details',
              method: 'GET',
              url: `${API_URL}/products/product/{product_id}`,
              parameters: {
                path: ['product_id'],
                instructions: 'Replace path with product id',
              },
            },
            {
              name: 'Cart',
              description: 'Get cart items for logged in user',
              method: 'GET',
              url: `${API_URL}/cart/get`,
            },
            {
              name: 'Add to cart',
              description: 'Add item to a cart with a product id',
              method: 'POST',
              url: `${API_URL}/cart/add`,
              parameters: {
                instructions:
                  'Get the product name or id of the product from user queries, also get the quantity. NOTE: no need to get the buyerId as it will automatically be provided to backend using token',
              },
            },
            {
              name: 'Delete from cart',
              description: 'Delete product from cart',
              method: 'DELETE',
              url: `${API_URL}/cart/delete/{productId}`,
              parameters: {
                path: ['productId'],
                instructions:
                  'Get the product id after api/cart/delete and hit the api',
              },
            },
            {
              name: 'Update to cart',
              description: 'Update product in cart',
              method: 'PUT',
              url: `${API_URL}/cart/update/{productId}/{quantity}`,
              parameters: {
                path: ['productId', 'quantity'],
                instructions:
                  'Get the product id and quantity from path after hitting api.',
              },
            },
            {
              name: 'Search Product',
              description: 'API for searching products',
              method: 'GET',
              url: `${API_URL}/products/search/{search_term}`,
              parameters: {
                path: ['search_term'],
                query: ['category', 'minPrice', 'maxPrice', 'page', 'limit', 'sort'],
                instructions:
                  'Replace path with product name. Include query parameters if provided. Return the API response as content.',
              },
            },
            {
              name: 'Search product by category',
              description:
                'Search any product by category only, no product name, case insensitive',
              method: 'GET',
              url: `${API_URL}/product/categories/get-product-by-category/{category_name}`,
              parameters: {
                path: ['category_name'],
                instructions:
                  'Search products with just category name by appending category name after url.',
              },
            },
          ]}
          domain='eCommerce - iShop'
          chatbotName='iShop-Chat'
          theme='dark'
          data={`Platform name: iShop, for buyers and vendors.
Official site: i-shop31.vercel.app
Pages: {domain}/privacy-policy, /refund-policy, /shipping-policy, /terms, /contact, /search (with category filter).
Buyers can see orders at {domain}/buyer/orders, notifications at /notifications.
Vendors can add products in categories like electronics, home appliances, clothing, books, sports, beauty, automotive, and jewelry.
Secure payments via Razorpay. 
Features: order tracking, notifications via SSE, add-to-cart, etc. (Don't mention technical details to users).`}
        />
      </div>
    </div>
  )
}

export default Home
