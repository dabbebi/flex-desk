import { client } from "../httpClient";


export const login = (email, password) => {
  return client.post("/login", 
  {
    email: email,
    password: password
  });
};

export const refreshToken = () => {
  return client.post(
    "/refresh",
    {},
    {
      headers: {
        refresh_token: localStorage.getItem("refresh_token")
      }
    }
  );
};

export const getIdentity = () => {
  return client.get(
    '/user/identity',
    {
      headers: {
        access_token: localStorage.getItem("access_token")
      }
    });
}