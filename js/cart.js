document.addEventListener('DOMContentLoaded', function () {
  function queue(){
    fetch('/orderQ', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({que: 1})
    }).then((res)=>{
      return res.json();
    }).then(data=>{
      const div=document.getElementById('queue');
      const h1=document.getElementById('head');
      h1.innerHTML=`Queue:${data}`;
      div.append(h1);
    })
  }
  queue();

  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  let cartItemsList = document.querySelector('.cart-items');
  const totalAmount = document.querySelector('.total-amount');
  let totalPrice = 0;

  // Load cart items from local storage
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartItems.forEach(item => {
    const listItem = createCartItem(item);
    cartItemsList.appendChild(listItem);
    totalPrice += item.price * item.quantity;
  });
  totalAmount.textContent = '₹' + totalPrice.toFixed(2);

  function createCartItem(item) {
    const listItem = document.createElement('div');
    if (item.price !== null && item.price !== undefined) {
      const price = item.price.toFixed(2);
      listItem.innerHTML = `
        ${item.name} - ₹${price} <br>
        <button class="decrease" data-name="${item.name}">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="increase" data-name="${item.name}">+</button>
        <button class="remove" data-name="${item.name}">Remove</button>
      `;
    } else {
      console.error('Item price is null or undefined:', item);
      // Optionally, you can skip creating the item here or display a placeholder
      // return null; // Skip creating the item
      // listItem.innerHTML = 'Price not available'; // Display a placeholder
    }
    return listItem;
  }

  function updateCart() {
    cartItemsList.innerHTML = '';
    totalPrice = 0;
    cartItems.forEach(item => {
      const listItem = createCartItem(item);
      cartItemsList.appendChild(listItem);
      totalPrice += item.price * item.quantity;
    });
    totalAmount.textContent = '₹' + totalPrice.toFixed(2);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }

  function addToCart(productName, productPrice) {
    const index = cartItems.findIndex(item => item.name === productName);
    if (index !== -1) {
      cartItems[index].quantity++;
    } else {
      cartItems.push({ name: productName, price: productPrice, quantity: 1 });
    }
    updateCart();
  }

  function removeFromCart(productName) {
    const index = cartItems.findIndex(item => item.name === productName);
    if (index !== -1) {
      const itemPrice = cartItems[index].price * cartItems[index].quantity;
      totalPrice -= itemPrice;
      cartItems.splice(index, 1);
      updateCart();
    }
  }

  function increaseQuantity(productName) {
    const index = cartItems.findIndex(item => item.name === productName);
    if (index !== -1) {
      cartItems[index].quantity++;
      updateCart();
    }
  }

  function decreaseQuantity(productName) {
    const index = cartItems.findIndex(item => item.name === productName);
    if (index !== -1 && cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
      updateCart();
    }
  }

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
      const productName = this.dataset.name;
      const productPrice = parseFloat(this.dataset.price);
      addToCart(productName, productPrice);
    });
  });

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('remove')) {
      const productName = event.target.dataset.name;
      removeFromCart(productName);
    }
    if (event.target.classList.contains('increase')) {
      const productName = event.target.dataset.name;
      increaseQuantity(productName);
    }
    if (event.target.classList.contains('decrease')) {
      const productName = event.target.dataset.name;
      decreaseQuantity(productName);
    }
    if (event.target.classList.contains('checkout')) { // Checkout button clicked
      checkout(); // Call the checkout function
    }
  });

  function checkout() {
    // Clear the cart items and update the UI
    cartItems.length = 0;
    if (totalPrice == 0)
      alert('Please order something')
    if (totalPrice != 0) {
      queue();
      alert(`Order Accepted Total Price:₹${totalPrice}`);
    }
    updateCart();
  }
});
