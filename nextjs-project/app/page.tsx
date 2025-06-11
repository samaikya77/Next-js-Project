import Nav from "@/components/nav";
import Footer from "@/components/footer";


export default function Home() {
  return (
    <>
    <Nav />
    <header className="container text-center py-5">
      <header className="mb-5">
        <h1 className="display-4 fw-bold">Welcome to SupaNext</h1>
        <p className="Lead">A Next.js Apllication with Supabase Integration</p>
        <button className="btn btn-primary btn-lg">Get Started</button>
      </header>
    </header>
    <section className="row g-4">
      
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Fast & Secure</h5>
              <p className="card-text">Build with Nextjs and Supabase, ensuring high performance and security.</p>
            </div>

          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Authentication</h5>
              <p className="card-text">Secure user authentication with supabase, including email and password login.</p>
            </div>

          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Data & Storage</h5>
              <p className="card-text">Manage your data and files effortlessley with supabase's powerful  database and storage solutions.</p>
            </div>

          </div>
        </div>
      </section>
      <Footer />
      </>
  );
}
