export default function Footer() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  return (
    <div className='bg-black text-white text-xs text-center w-full p-2 mt-10 pb-10'>
      <span className='text-yellow-300'>git grocery things</span> © {year} James
      Malvern
    </div>
  );
}
