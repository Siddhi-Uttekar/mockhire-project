import JobPostingForm from "@/components/JobPostingForm";
import RecruiterNavbar from "@/components/RecruiterNavbar";

const PostJobPage = () => {
  return (
    <div>
      <RecruiterNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
        <div className="max-w-2xl mx-auto">
          <JobPostingForm />
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;
