// import styles from "./PaginationNavigation.module.css";

function PaginationNavigation({
  currentPage,
  nPages,
  maxPageBtns,
  fetchNext,
  fetchPrev,
  fetchPage,
}) {
  const pageOffset =
    1 +
    Math.max(
      0,
      Math.min(
        currentPage - (Math.floor(maxPageBtns / 2) + 1),
        nPages - maxPageBtns,
      ),
    );

  return (
    <nav>
      <button disabled={currentPage <= 1} onClick={fetchPrev}>
        Prev
      </button>
      {Array.from({ length: Math.min(maxPageBtns, nPages) }, (_, i) => {
        const n = i + pageOffset;
        return (
          <button
            key={n}
            disabled={n === currentPage}
            onClick={() => fetchPage(n)}
          >
            {n}
          </button>
        );
      })}
      <button disabled={currentPage >= nPages} onClick={fetchNext}>
        Next
      </button>
    </nav>
  );
}

export default PaginationNavigation;
