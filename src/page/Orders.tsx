import { useOrders, useGenerateOrderDoc } from "@/hooks/useOrder";
export default function Orders() {
  const { data: orders, isLoading } = useOrders({ page: 1, limit: 10 });
  const { mutate: generateDoc } = useGenerateOrderDoc();

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Orders</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order Number</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders?.data?.map((order: any) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{order.orderNumber}</td>
                <td className="p-4 text-blue-600 font-semibold">
                  ${Number(order.total).toFixed(2)}
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => generateDoc(order.id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                  >
                    📄 Download Doc
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}