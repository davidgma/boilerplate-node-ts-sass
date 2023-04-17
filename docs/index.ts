console.log('Hello from TypeScript');

onload = (event) => {
  console.log('page loaded');
  const elements = document.getElementsByClassName('myClass');
  const element = elements[0];
  element.innerHTML = 'Hello from TypeScript';
};
