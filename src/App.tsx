import {
  Refine,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import "./App.css";
import Dashboard from "./pages/dashboard";
import {BookOpen, GraduationCap, Home} from 'lucide-react'
import SubjectList from "./pages/subjects/list";
import SubjectCreate from "./pages/subjects/create";
import ClassList from "./pages/classes/list";
import ClassCreate from "./pages/classes/create";
function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "WMF8Ar-q0ccy0-6p3ZGU",
              }}
              resources={[
                {
                  name: "dashboard",
                  list: '/',
                  meta: {
                    label: 'Home',
                    icon: <Home />
                  }
                },
                {
                  name: 'subjects',
                  list: 'subjects',
                  create: 'subjects/create',
                  meta:{
                    label: 'Subjects',
                    icon: <BookOpen/>
                
                  }
                  
                },
                {
                  name: 'classes',
                  list: 'classes',
                  create: 'classes/create',
                  meta:{
                    label: 'Classes',
                    icon: <GraduationCap/>
                
                  }
                }
              ]}
            >
              <Routes>
                <Route element={
                  <Layout>
                    <Outlet/>
                  </Layout>
                }>
                  <Route path="/" element={<Dashboard/>} />
                  <Route path="/subjects" element={<SubjectList/> }/>
                  <Route path="/subjects/create" element={<SubjectCreate/>}/>

                  <Route path="/classes">
                    <Route index element={<ClassList/> }/>
                    <Route path="create" element={<ClassCreate/>}/>
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
