
import './App.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import Dashboard from './components/dashboard';
import Expense from './components/expense';
import AddExpense from './components/addExpense';
import LoginPage from './components/login';
import SignupPage from './components/signUp';
import LoginLayout from './components/loginLayout';
import Profile from './components/profile';
import CategoryPage from './components/category';

import Extra from './components/extra';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Chatbot from './components/chatbot';
import Manual from './components/addManual';
import Multiple from './components/addMultiple';
import { AuthProvider } from './context/AuthProvider';
import Reports from './components/repots';
import Alerts from './components/alerts';
import About from './components/about';
import VoiceDrafts from './components/voiceDraft';



function App() {
  return (
    
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route  path="/" element={<PublicRoute> <LoginLayout/> </PublicRoute> }>
          <Route  path="/signup" element={<SignupPage/>}/>
          <Route  path="/login" element={ <LoginPage/>}/> 
          <Route index  element={ <LoginPage/>}/>
        </Route>
        <Route path="/main" element={<ProtectedRoute> <Main/> </ProtectedRoute>}>
            
            <Route  path="/main/dashboard" element={<Dashboard/>}/>
            <Route path="/main/expenses" element={<Expense/>}/>
            <Route path="/main/chatbot" element={<Chatbot/>}/>
            <Route path="/main/addExpense" element={<AddExpense/>}/>
            <Route path="/main/profile" element={<Profile/>}/>
            <Route path="/main/category" element={<CategoryPage/>}/>
            <Route path="/main/budget" element={<Extra/>}/>
            <Route path="/main/manual" element={<Manual/>}/>
            <Route path="/main/multiple" element={<Multiple/>}/>
            <Route path="/main/reports" element={<Reports/>}/>
            <Route path="/main/alerts" element={<Alerts/>}/>
            <Route path="/main/about" element={<About/>}/>
            <Route path="/main/voice-drafts" element={<VoiceDrafts />} />

        </Route>

      </Routes>
    </BrowserRouter>
    </AuthProvider>
    

  );
}

export default App;
