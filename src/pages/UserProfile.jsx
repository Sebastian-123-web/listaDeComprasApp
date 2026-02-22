import { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import Back from "../components/Back";
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function UserProfile() {
  // 1. Obtenemos el perfil único (ID: 1)
  const user = useLiveQuery(() => db.userProfile.get(1));
  const lists = useLiveQuery(() => db.lists.toArray());

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  // Lógica para la gráfica de gastos (últimas 5 listas)
  const chartData = useLiveQuery(async () => {
    const allLists = await db.lists.toArray();
    const lastFive = allLists.slice(-5);
    return await Promise.all(lastFive.map(async (l) => {
      const items = await db.list_product.where("id_lists").equals(l.id).toArray();
      const total = items.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0);
      return { name: l.name.substring(0, 10), total: total };
    }));
  });

  const handleEdit = () => {
    setTempUser({ ...user });
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Función de limpieza que ya conocemos para nombre y apellido
    const format = (str) => str ? str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase() : "";

    const updatedData = {
      ...tempUser,
      name: format(tempUser.name),
      last_name: format(tempUser.last_name),
      email: tempUser.email.toLowerCase().trim()
    };

    await db.userProfile.update(1, updatedData);
    setIsEditing(false);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Perfil actualizado',
      showConfirmButton: false,
      timer: 2000
    });
  };

  if (!user) return <div className="p-10 text-center animate-pulse">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Cabecera */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Back />
          <h1 className="text-xl font-bold text-gray-800">Mi Perfil</h1>
        </div>
        <button
          onClick={isEditing ? handleSave : handleEdit}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isEditing ? "bg-green-500 text-white" : "bg-amber-100 text-amber-700"
            }`}
        >
          {isEditing ? "Guardar" : "Editar"}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Sección de Avatar y Nombre Principal */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="relative">
            <div className="w-24 h-24 bg-amber-600 rounded-full shadow-xl flex items-center justify-center text-5xl border-4 border-white">
              {user.avatar || user.name.charAt(0)}
            </div>
            {isEditing && (
              <button
                onClick={async () => {
                  const { value: emoji } = await Swal.fire({
                    title: 'Cambiar Emoji',
                    input: 'text',
                    inputPlaceholder: 'Pega un emoji aquí...',
                    confirmButtonColor: '#d97706'
                  });
                  if (emoji) setTempUser({ ...tempUser, avatar: emoji });
                }}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100"
              >
                📸
              </button>
            )}
          </div>
          {!isEditing && (
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800">{user.name} {user.last_name}</h2>
              <p className="text-gray-400 text-sm">{user.email || "Sin correo electrónico"}</p>
            </div>
          )}
        </div>

        {/* Formulario Detallado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[3px] mb-2">Datos Personales</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400">Nombre</label>
              {isEditing ? (
                <input
                  className="bg-gray-50 p-3 rounded-xl focus:ring-2 ring-amber-500 outline-none transition-all"
                  value={tempUser.name}
                  onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
                />
              ) : (
                <p className="font-semibold text-gray-700">{user.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400">Apellido</label>
              {isEditing ? (
                <input
                  className="bg-gray-50 p-3 rounded-xl focus:ring-2 ring-amber-500 outline-none transition-all"
                  value={tempUser.last_name}
                  onChange={(e) => setTempUser({ ...tempUser, last_name: e.target.value })}
                />
              ) : (
                <p className="font-semibold text-gray-700">{user.last_name || "-"}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">Correo Electrónico</label>
            {isEditing ? (
              <input
                type="email"
                className="bg-gray-50 p-3 rounded-xl focus:ring-2 ring-amber-500 outline-none transition-all"
                value={tempUser.email}
                onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })}
              />
            ) : (
              <p className="font-semibold text-gray-700">{user.email || "No registrado"}</p>
            )}
          </div>
        </div>

        {/* Sección de Estadísticas y Gráfica */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[3px] mb-6">Actividad Reciente</h3>

          <div className="h-44 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" radius={[6, 6, 6, 6]} barSize={35}>
                  {chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d97706' : '#fbbf24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border-b-4 border-amber-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Listas</p>
              <p className="text-2xl font-black text-gray-800">{lists?.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border-b-4 border-green-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Estado Cuenta</p>
              <p className="text-2xl font-black text-gray-800">Activa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;