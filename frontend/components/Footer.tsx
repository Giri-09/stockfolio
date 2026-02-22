export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[86%] 2xl:max-w-[82%] px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} StockFolio. All rights reserved.
        </p>
        <p className="text-xs text-gray-500">
          Powered by Yahoo Finance &amp; Google Finance
        </p>
      </div>
    </footer>
  );
}
