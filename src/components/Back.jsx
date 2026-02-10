import { Link } from "react-router"

function Back () {
  return (
    <>
        <Link to={-1} className="w-6 h-6">
            <div className="relative cursor-pointer w-6 h-6">
            <div className="bg-amber-600 w-1 h-4 rounded-2xl absolute left-2 top-0 rotate-45"></div>
            <div className="bg-amber-600 w-1 h-4 rounded-2xl absolute left-2 top-[9px] -rotate-45 "></div>
            </div>
        </Link>
    </>
  )
}

export default Back