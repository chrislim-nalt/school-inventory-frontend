import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Dashboard from "./components/pages/Dashboard";
import Categories from "./components/pages/Categories";
import Items from "./components/pages/Items";
import Stock from "./components/pages/Stock";
import Assets from "./components/pages/Assets";
import Laboratory from "./components/pages/Laboratory";
import Library from "./components/pages/Library";
import CleaningSupplies from "./components/pages/CleaningSupplies";
import BorrowedItems from "./components/pages/BorrowedItems";
import TrackedAssets from "./components/pages/TrackedAssets";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/pages/Profile";

// School Feeding - Single unified page
import FeedingRecords from "./components/pages/FeedingRecords";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES WITH LAYOUT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Layout>
                <Items />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Layout>
                <Stock />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Layout>
                <Assets />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/laboratory"
          element={
            <ProtectedRoute>
              <Layout>
                <Laboratory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Layout>
                <Library />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaning-supplies"
          element={
            <ProtectedRoute>
              <Layout>
                <CleaningSupplies />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/borrowed"
          element={
            <ProtectedRoute>
              <Layout>
                <BorrowedItems />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ASSET TRACKING ROUTE */}
        <Route
          path="/tracked-assets"
          element={
            <ProtectedRoute>
              <Layout>
                <TrackedAssets />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================== SCHOOL FEEDING ROUTE ==================== */}
        {/* Single unified page for all feeding records */}
        <Route
          path="/feeding"
          element={
            <ProtectedRoute>
              <Layout>
                <FeedingRecords />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;