// import React from 'react'

// export default function ReceiptModal({ receipts, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded max-h-full overflow-y-auto w-full max-w-lg fade-in">
//         <h2 className="text-xl font-bold mb-4">Ваше замовлення</h2>
//         {receipts.map((r, idx) => (
//           <div key={idx} className="mb-4 border-b pb-2 slide-up">
//             <p className="font-medium">{r.name}</p>
//             <p>Кількість: {r.quantity}</p>
//             <p>Ціна: {r.price} ₴</p>
//             <p className="font-semibold">Сума: {r.total} ₴</p>
//           </div>
//         ))}
//         <button
//           onClick={onClose}
//           className="mt-4 px-3 py-2 bg-blue-500 text-white rounded pulse-hover"
//         >
//           Закрити
//         </button>
//       </div>
//     </div>
//   )
// }
