import { useEffect } from "react"
import { useNavigate } from "react-router"

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/mylists")
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <img src="/carrito.gif" alt="" />
    </div>
  );
}

export default Home;