import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import "./App.css";
import Dashboard from "./pages/dashboard";
import { BookOpen, GraduationCap, Users, Building2, LayoutDashboard, Settings } from 'lucide-react';

// Users
import UserList from "./pages/users/list";
import UserShow from "./pages/users/show";
import UserEdit from "./pages/users/edit";
import UserCreate from "./pages/users/create";

// Departments
import DepartmentList from "./pages/departments/list";
import DepartmentCreate from "./pages/departments/create";
import DepartmentEdit from "./pages/departments/edit";

// Subjects
import SubjectList from "./pages/subjects/list";
import SubjectCreate from "./pages/subjects/create";
import SubjectEdit from "./pages/subjects/edit";

// Classes
import ClassList from "./pages/classes/list";
import ClassCreate from "./pages/classes/create";
import ClassShow from "./pages/classes/show";
import ClassEdit from "./pages/classes/edit";

// Settings
import SettingsPage from "./pages/settings";

// Auth
import LoginPage from "./pages/login";

// App logo
const AppLogo = () => (
  <img src="/logo.png" alt="ClassroomMS" className="h-7 w-7 rounded object-cover" />
);

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "WMF8Ar-q0ccy0-6p3ZGU",
                reactQuery: {
                  clientConfig: {
                    defaultOptions: {
                      queries: {
                        staleTime: 1000 * 30, // 30 seconds fresh
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                        retry: false, // Do not auto-retry failed queries (prevents 401 refetch storms)
                      },
                    },
                  },
                },
                title: {
                  text: "Classroom MS",
                  icon: <AppLogo />,
                },
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Dashboard",
                    icon: <LayoutDashboard />,
                  },
                },
                {
                  name: "users",
                  list: "/users",
                  create: "/users/create",
                  show: "/users/show/:id",
                  edit: "/users/edit/:id",
                  meta: {
                    label: "Users",
                    icon: <Users />,
                  },
                },
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/edit/:id",
                  meta: {
                    label: "Departments",
                    icon: <Building2 />,
                  },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/edit/:id",
                  meta: {
                    label: "Subjects",
                    icon: <BookOpen />,
                  },
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  edit: "/classes/edit/:id",
                  show: "/classes/show/:id",
                  meta: {
                    label: "Classes",
                    icon: <GraduationCap />,
                  },
                },
                {
                  name: "settings",
                  list: "/settings",
                  meta: {
                    label: "Settings",
                    icon: <Settings />,
                  },
                },
              ]}
            >
              <Routes>
                {/* ── Public: Login ── */}
                <Route path="/login" element={<LoginPage />} />

                {/* ── Protected: all other pages require auth ── */}
                <Route
                  element={
                    <Authenticated key="authenticated-routes" redirectOnFail="/login">
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route path="/" element={<Dashboard />} />

                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/create" element={<UserCreate />} />
                  <Route path="/users/show/:id" element={<UserShow />} />
                  <Route path="/users/edit/:id" element={<UserEdit />} />

                  <Route path="/departments" element={<DepartmentList />} />
                  <Route path="/departments/create" element={<DepartmentCreate />} />
                  <Route path="/departments/edit/:id" element={<DepartmentEdit />} />

                  <Route path="/subjects" element={<SubjectList />} />
                  <Route path="/subjects/create" element={<SubjectCreate />} />
                  <Route path="/subjects/edit/:id" element={<SubjectEdit />} />

                  <Route path="/classes">
                    <Route index element={<ClassList />} />
                    <Route path="create" element={<ClassCreate />} />
                    <Route path="edit/:id" element={<ClassEdit />} />
                    <Route path="show/:id" element={<ClassShow />} />
                  </Route>

                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler handler={({ resource }) =>
                resource?.name
                  ? `${resource.meta?.label ?? resource.name} | Classroom MS`
                  : "Classroom MS"
              } />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
