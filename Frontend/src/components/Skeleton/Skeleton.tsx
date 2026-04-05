import { Box } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

export default function ShowChatSkeleton() {
  return (
    <div className="flex min-h-screen items-top bg-zinc-500 font-sans dark:bg-[#010a13] overflow-hidden" >
      <div className="flex justify-start items-center w-full mr-6" >
        <Box sx={{ width: "70vh" }}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      </div>
      <div className="flex justify-end items-center w-full ml-6" >
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
      </div>
    </div>
  );
}