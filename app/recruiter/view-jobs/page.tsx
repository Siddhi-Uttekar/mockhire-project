import JobList from "@/components/JobList";
import RecruiterNavbar from "@/components/RecruiterNavbar";

const ViewJobsPage = () => {
  return (
    <div>
      <RecruiterNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Job Postings</h1>
        <JobList />
      </div>
    </div>
  );
};

export default ViewJobsPage;
