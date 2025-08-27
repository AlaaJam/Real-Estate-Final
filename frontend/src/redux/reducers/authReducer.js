const initial = { user: null };

export default function authReducer(state = initial, action) {
  switch (action.type) {
    case "AUTH/SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}
