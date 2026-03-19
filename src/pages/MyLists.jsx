import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"
import Swal from 'sweetalert2'

function MyLists() {
  // 1. Obtenemos el perfil directamente de la base de datos
  const userProfile = useLiveQuery(() => db.userProfile.get(1));
  const lists = useLiveQuery(async () => {
    const allLists = await db.lists.toArray();

    // Traemos el conteo para cada lista
    const listsWithStats = await Promise.all(
      allLists.map(async (list) => {
        const items = await db.list_product
          .where("id_lists")
          .equals(list.id)
          .toArray();

        // Calculamos el total de ESTA lista específica
        const listTotal = items.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0);

        return {
          ...list,
          totalItems: items.length,
          boughtItems: items.filter(i => i.bought === 1).length
        };
      })
    );

    return listsWithStats;
  }, []);
  const [listSearch, setListSearch] = useState("");

  // PARA GUARDAR PRESUPUESTO
  const [budget, setBudget] = useState()

  useEffect(() => {
    obtenerPresupuesto()
    // 2. Función para pedir el nombre si no existe en la DB
    const checkUser = async () => {
      // Esperamos un momento a que useLiveQuery verifique la DB
      const userExists = await db.userProfile.get(1);

      if (!userExists) {
        const { value: name } = await Swal.fire({
          title: '¡Bienvenido!',
          text: '¿Cómo te llamas?',
          input: 'text',
          inputPlaceholder: 'Tu nombre aquí...',
          allowOutsideClick: false,
          confirmButtonColor: '#d97706',
          inputValidator: (value) => {
            if (!value) return '¡Necesito saber tu nombre!'
          }
        });

        if (name) {
          // Formateamos: Primera Mayúscula, resto minúscula
          const formattedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

          await db.userProfile.add({
            id: 1,
            name: formattedName,
            last_name: "",
            email: "",
            avatar: "",
            isDisable: false
          });
        }
      }
    };

    checkUser();
  }, []);

  // OBTIENE LA SUMA DE TODOS LOS PRESUPUESTO DE CADA LISTA
  const obtenerPresupuesto = async () => {
    const todosPresupuesto = await db.lists.orderBy("budget").uniqueKeys()
    setBudget(todosPresupuesto.reduce((actual,siguiente)=>actual+siguiente,0))
  }

  // MUESTRA LA LISTA DE COMPRAS
  const filteredList = lists?.filter(p => p.isDisable !== true && p.name.toLowerCase().includes(listSearch.toLowerCase())) || [];

  if (!lists || userProfile === undefined) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className='bg-gray-200 min-h-screen flex flex-col gap-4 p-4'>
      {/* HEADER ACTUALIZADO */}
      <div className='flex justify-between items-center'>
        <div className='w-full'>
          {/* USAMOS EL NOMBRE DE LA DB */}
          <h1 className='text-xl font-bold text-amber-900'>¡Hola {userProfile?.name}!</h1>
          <p className='text-gray-600'>Bienvenido a tu Lista de Compras</p>
        </div>
        <Link to={"/userprofile"}>
          <div className='bg-amber-600 w-11 h-11 rounded-3xl border-2 border-white shadow-md flex justify-center items-center'>
            <p className='text-2xl font-bold text-white'>
              {userProfile?.avatar || userProfile?.name?.charAt(0) || "U"}
            </p>
          </div>
        </Link>
      </div>


      <div className='p-5 bg-white rounded-2xl relative'>
        <div>
          <p className='mb-1 text-gray-500'>Presupuesto general</p>
          <p className='text-4xl font-bold'>S/. {budget}</p>
        </div>
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
          {listSearch && (
            <button
              onClick={() => setListSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <div className='flex flex-col gap-4 h-[calc(100vh-395px)] overflow-auto rounded-2xl'>
          {
            filteredList.length === 0 ? (
              <p className="text-gray-500 text-center py-10 rounded-xl">
                No has creado tu lista :c
              </p>
            ) : (
              filteredList.map((l) => (
                <Link to={`/mylist/` + l.id} key={l.id}>
                  <div className='bg-white px-6 py-4 rounded-2xl border-l-4 border-amber-500 mb-2'>
                    <div className='flex justify-between gap-1'>
                      <div className='flex gap-2 items-center'>
                        <p className='text-2xl'>{l.icon}</p>
                        <p className='text-2xl font-bold capitalize text-gray-800'>{l.name}</p>
                      </div>
                      <span className='flex gap-1 items-center bg-amber-600 px-3 py-1 rounded-2xl'>
                        <p className='text-[10px] font-bold text-white uppercase tracking-tighter'>
                          Items: {l.boughtItems}/{l.totalItems}
                        </p>
                      </span>
                    </div>
                    <div className='flex justify-between items-center mt-1'>
                      <p className='text-gray-500 text-sm'>{l.description}</p>
                    </div>
                  </div>
                </Link>
              ))
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
  );
}

export default MyLists