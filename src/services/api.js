import axios from "axios";
// axios es una librería que te permite hacer peticiones HTTP (GET, POST, PUT, DELETE) a una API de manera fácil.


//axios.create() crea una instancia personalizada de axios.
const api = axios.create({
    baseURL: "http://localhost:3000",
});

export default api;