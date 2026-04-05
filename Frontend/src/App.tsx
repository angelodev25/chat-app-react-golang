import { BrowserRouter, Route, Routes } from "react-router-dom"
import Main from "./pages/Main"
import ProtectedRoute from "./auth/ProtectedRoute"
import Login from "./pages/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
