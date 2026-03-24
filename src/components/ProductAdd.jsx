import { useState, useEffect } from "react"

function ProductAdd({ id, name, price, icon, initialPrice, initialCount, onPriceChange, onCountChange }) {

  const [count, setCount] = useState(initialCount)
  const [isEditing, setIsEditing] = useState(false)
  const [tempPrice, setTempPrice] = useState(initialPrice ?? price)

  // SINCRONIZAMOS
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    setTempPrice(initialPrice ?? price);
  }, [initialPrice, price]);


  const handleBlur = () => {
    setIsEditing(false)
    const finalPrice = parseFloat(tempPrice) || 0
    setTempPrice(finalPrice)
    if (onPriceChange) onPriceChange(finalPrice)
  }

  const handleIncrement = () => {
    const newCount = count + 1
    setCount(newCount)
    onCountChange(newCount)

    if (count === 0) {
      onPriceChange(parseFloat(tempPrice) || 0)
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      const newCount = count - 1
      setCount(newCount)
      onCountChange(newCount)
    }
  };

  return (
    <div
      id={id}
      className={`bg-white p-4 rounded-2xl flex justify-between items-center transition-all ${count > 0 ? 'border-l-4 border-green-500 bg-green-50' : ''}`}>
      <div className='flex items-center gap-2'>
        <p className="text-2xl">{icon}</p>
        <div className="flex gap-3">
          <p className='font-bold text-gray-800'>{name}</p>

          {/* LÓGICA DEL PRECIO EDITABLE */}
          {isEditing ? (
            <input
              autoFocus
              type="number"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              className="w-20 py-1 px-2 border-2 border-emerald-400 rounded-lg text-xs font-bold focus:outline-none"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className='w-fit cursor-pointer py-1 px-3 bg-emerald-100 rounded-full text-xs text-emerald-800 font-bold hover:bg-emerald-200 transition-colors'
            >
              S/ {tempPrice ?? 0}
            </span>
          )}
        </div>
      </div>

      <div className='flex gap-2.5 items-center'>
        <button
          className='font-bold text-3xl text-gray-300 active:text-orange-500 transition-colors'
          onClick={handleDecrement}>
          -
        </button>
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${count > 0 ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
          {count}
        </div>
        <button
          className='font-bold text-3xl text-gray-300 active:text-orange-500 transition-colors'
          onClick={handleIncrement}>
          +
        </button>
      </div>
    </div>
  )
}

export default ProductAdd