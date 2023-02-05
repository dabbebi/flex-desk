import { client } from "../httpClient";


export const bookNewPlace = (data) => {
  return client.post("/place/book", 
  data,
  {
    headers: {
      access_token: localStorage.getItem("access_token")
    }
  });
};

export const freePlace = (data) => {
  return client.post(
    "/place/unbook",
    data,
    {
      headers: {
        access_token: localStorage.getItem("access_token")
      }
    }
  );
};

export const getOfficeStatus = (data) => {
  return client.post(
    '/place/officestatus',
    data,
    {
      headers: {
        access_token: localStorage.getItem("access_token")
      }
    });
}