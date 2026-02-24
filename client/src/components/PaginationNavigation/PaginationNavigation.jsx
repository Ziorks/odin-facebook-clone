import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import styles from "./PaginationNavigation.module.css";

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
    <nav className={styles.primaryContainer}>
      {currentPage > 1 && (
        <button onClick={fetchPrev}>
          <IoChevronBackSharp /> Prev
        </button>
      )}
      <div className={styles.pageBtnsContainer}>
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
      </div>
      {currentPage < nPages && (
        <button onClick={fetchNext}>
          Next <IoChevronForwardSharp />
        </button>
      )}
    </nav>
  );
}

export default PaginationNavigation;
