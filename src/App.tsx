import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import DashboardLaysOut from './layouts/DashboardLaysOut';
import Product from './page/Products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Category from './page/Category';
import { Toaster } from './components/ui/sonner';
import MainLayout from './layouts/MainLayout';
import FormLoginPage from './page/FormLoginPage';
import User from './page/User';
import PosPage from './page/PosPage';
const queryClient = new QueryClient()
function App() {
  return (

      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <Routes>
        <Route  element={<MainLayout/>}> 
        <Route path='/login' element= {<FormLoginPage/>} ></Route>
        </Route>
        <Route path="/" element={<DashboardLaysOut />}>    
          {/* Products page */}
          <Route path="/admin/products" element={<Product />} />
          {/* categories page */}
          <Route path="/admin/categories" element={<Category />} />
           {/* user */}
          <Route path="/admin/user" element={<User />} />
          <Route path="/admin/pos" element={<PosPage />} />
        </Route>
      </Routes>   
    </BrowserRouter>
    <Toaster position='top-center'/>
    </QueryClientProvider>
    
  )
}

export default App;