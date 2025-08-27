import {
  GET_PROPERTIES,
  GET_FEATURED_PROPERTIES,
  GET_PROPERTY,
} from "../constants/propertyConstants";
import { api } from "../../helpers/api";


const toPublicUrl = (name) => {
  if (!name) return "/placeholder.jpg";
  if (/^https?:\/\//i.test(name) || name.startsWith("/")) return name;
  return `/images/houses/${name.replace(/^\/+/, "")}`;
};

const toCard = (row) => ({
  id: row.id,
  title: row.title,
  price: row.price,
  location: [row.city, row.state].filter(Boolean).join(", "),
  description: row.description || "",
  imageUrl: toPublicUrl(row.imageUrl),
  featured: !!row.featured,
});

export const getPropertyList = (page = 1, limit = 12) => async (dispatch) => {
  const rows = await api(`/api/properties?page=${page}&limit=${limit}`);
  dispatch({ type: GET_PROPERTIES, payload: rows.map(toCard) });
};

export const getFeaturedList = () => async (dispatch) => {
  const rows = await api(`/api/properties?featured=true&limit=6`);
  dispatch({ type: GET_FEATURED_PROPERTIES, payload: rows.map(toCard) });
};

export const getProperty = (id) => async (dispatch) => {
  const row = await api(`/api/properties/${id}`);
  dispatch({ type: GET_PROPERTY, payload: toCard(row) });
};
