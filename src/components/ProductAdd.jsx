import { useState } from "react"

function ProductAdd({ id, name, price, icon, onCountChange, onPriceChange }) {

    const [count, setCount] = useState(0)

    const [isEditing, setIsEditing] = useState(false);
    const [tempPrice, setTempPrice] = useState(price);

    const handleBlur = () => {
        setIsEditing(false);
        // Avisamos al padre o a la DB que el precio cambió
        if (onPriceChange) onPriceChange(id, parseFloat(tempPrice));
    };

    // Cada vez que sumamos o restamos, llamamos a la prop onCountChange
    const handleIncrement = () => {
        const newCount = count + 1;
        setCount(newCount);
        onCountChange(newCount);
    };

    const handleDecrement = () => {
        if (count > 0) {
            const newCount = count - 1;
            setCount(newCount);
            onCountChange(newCount);
        }
    };

    return (
        <>
            <div
                id={id}
                className='bg-white p-4 rounded-2xl flex justify-between items-center has-[:checked]:border-green-500 has-[:checked]:bg-green-50'>
                <div className='flex items-center gap-2'>
                    <p className="text-2xl">{icon}</p>
                    <p className='font-bold'>{name}</p>

                    {/* LÓGICA DEL PRECIO EDITABLE */}
                    {isEditing ? (
                        <input
                            autoFocus
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                            className="w-16 py-1 px-2 border-2 border-emerald-400 rounded-lg text-xs font-bold focus:outline-none"
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            className='cursor-pointer py-1 px-3 bg-emerald-100 rounded-full text-xs text-emerald-800 font-bold hover:bg-emerald-200 transition-colors'
                        >
                            S/ {tempPrice}
                        </span>
                    )}
                </div>
                <div className='flex gap-2.5'>
                    <button className='font-bold text-3xl text-gray-400 active:text-orange-500' onClick={handleDecrement}>-</button>
                    <div className={`px-4 py-2 rounded-xl font-bold ${count > 0 ? 'bg-green-500 text-white' : 'bg-amber-200'}`}>
                        {count}
                    </div>
                    <button className='font-bold text-3xl text-gray-400 active:text-orange-500' onClick={handleIncrement}>+</button>
                </div>
            </div>
        </>
    )
}

export default ProductAdd