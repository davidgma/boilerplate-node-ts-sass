console.log('Hello from TypeScript');
onload = function (event) {
    console.log('page loaded');
    var elements = document.getElementsByClassName('myClass');
    var element = elements[0];
    element.innerHTML = 'Hello from TypeScript';
};
