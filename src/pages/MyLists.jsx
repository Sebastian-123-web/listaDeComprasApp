import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"

function MyLists() {
  // MUESTRA LAS LISTAS QUE EL USUARIO TIENE GUARDADO
  const lists = useLiveQuery(() => db.lists.toArray())
  const [listSearch, setListSearch] = useState("")

  // PARA GUARDAR PRESUPUESTO Y CAMBIAR EL BOTON
  const [budget, setBudget] = useState(localStorage.getItem("budgetList") ? localStorage.getItem("budgetList") : 0)
  const [isEditing, setIsEditing] = useState(false)

  // PARA GUARDAR USUARIO
  const [user, setUser] = useState(localStorage.getItem("user") ? localStorage.getItem("user") : null)


  // PARA GUARDAR PRESUPUESTO
  const budgetList = () => {
    localStorage.setItem("budgetList", budget)
  }

  // MUESTRA LA LISTA DE COMPRAS
  const filteredList = lists?.filter(p => p.isDisable !== true && p.name.toLowerCase().includes(listSearch.toLowerCase())) || [];

  useEffect(() => {
    // GUARDA NOMBRE DE USUARIO
    const userListShopping = () => {
      if (!localStorage.getItem("user")) {
        let user = prompt("Bienvenido! por favor ingrese su nombre...")
        user = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase()
        localStorage.setItem("user", user)
        setUser(user)
      }
    }
    userListShopping()
  }, [])

  // MUESTRA LAS LISTAS QUE EL USUARIO TIENE GUARDADO
  if (!lists) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className='bg-gray-200 h-screen flex flex-col gap-4 p-4'>
        <div className='flex justify-between items-center'>
          <div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/6499/6499731.png"
              alt=""
              className='w-10 h-7' />
          </div>
          <Link to={"/userprofile"}>
            <div className='bg-amber-600 w-11 h-11 rounded-3xl border-amber-700 hover:border-gray-400 cursor-pointer'>
              <div className='w-full h-full flex justify-center items-center'>
                <p className='text-2xl font-bold text-white'>S</p>
              </div>
            </div>
          </Link>
        </div>
        <div className='w-full'>
          <h1 className='text-xl font-bold'>Hola {user}!</h1>
          <p>Bienvenido a tu Lista de Compras</p>
        </div>
        <div className='p-5 bg-white rounded-2xl relative'>
          <div>
            <p className='mb-1 text-gray-500'>Presupuesto general</p>
            {isEditing == false ?
              <p className='text-4xl font-bold'>S/. {budget} </p> :
              <input type="txt" className='text-4xl font-bold w-2xs border' value={budget} onChange={(e) => setBudget(e.target.value)} />
            }
          </div>
          {
            isEditing == false ?
              <div className='absolute bottom-4 right-4' onClick={() => setIsEditing(true)}>
                <img
                  src="https://www.freeiconspng.com/thumbs/edit-icon-png/edit-new-icon-22.png"
                  alt=""
                  className='w-7 h-7'
                />
              </div> :
              <div className='absolute bottom-4 right-4'
                onClick={() => {
                  setIsEditing(false);
                  budgetList();
                }}>
                <img
                  src="https://icon-icons.com/download-file?file=https%3A%2F%2Fimages.icon-icons.com%2F1506%2FPNG%2F512%2Femblemok_103757.png&id=103757&pack_or_individual=pack"
                  alt=""
                  className='w-7 h-7' />
              </div>
          }
        </div>
        <div className=''>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-xl font-bold'>Mis Listas</h2>
          </div>

          {/* MUESTRA LA LISTA DE COMPRAS Y FILTRA */}
          <div className="flex flex-col relative w-full mb-4">
            <input
              type="text"
              id="name-search"
              className="peer shadow-xl font-bold block w-full rounded-lg bg-white bg-transparent px-3 pt-4 pb-2 text-gray-900 focus:outline-none transition-colors"
              placeholder=" "
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />
            <label
              htmlFor="name-search"
              className="absolute left-3 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform  px-2 text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-orange-500">
              Buscar tu lista de compras
            </label>
          </div>
          <div className='flex flex-col gap-4 h-[calc(100vh-395px)] overflow-auto rounded-2xl'>
            {
              filteredList.length === 0 ? (
                <p className="text-gray-500 text-center py-10 rounded-xl">
                  No has creado tu lista :c
                </p>
              ) : (
                filteredList.map(
                  (l) => (
                    <Link to={`/mylist/` + l.id} key={l.id} >
                      <div className='bg-white px-6 py-4 rounded-2xl'>
                        <div className='flex justify-between gap-1'>
                          <div className='flex gap-2 items-center'>
                            <p className='text-2xl'>{l.icon}</p>
                            <p className='text-2xl font-bold capitalize'>{l.name}</p>
                          </div>
                          <span className='flex gap-1 items-center bg-amber-600 px-3 py-0 m-1 rounded-2xl'>
                            <p className='text-xs font-bold text-white'>15</p>
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/67/67670.png"
                              alt=""
                              className='w-3 h-3 [filter:brightness(0)_invert(1)]' />
                          </span>
                        </div>
                        <div className='flex'>
                          <p className='text-gray-500'>{l.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                )
              )
            }
          </div>
        </div>
        <div className='fixed bottom-4 right-0 w-full text-center px-4'>
          <Link to={"/newlist"} className='block bg-amber-600 p-3 rounded-2xl active:bg-amber-500'>
            <p className='text-xl font-bold text-white'>NUEVA LISTA</p>
          </Link>
        </div>
      </div>
    </>
  )
}

export default MyLists