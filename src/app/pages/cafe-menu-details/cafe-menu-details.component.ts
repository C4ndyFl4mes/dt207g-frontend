import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CafeService } from '../../services/cafe.service';
import { Product } from '../../models/product';
import { Review } from '../../models/review';
import { Pagination } from '../../models/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cafe-menu-details',
  imports: [FormsModule],
  templateUrl: './cafe-menu-details.component.html',
  styleUrl: './cafe-menu-details.component.scss'
})
export class CafeMenuDetailsComponent implements OnInit {

  categorySlug = signal<string | null>("");
  itemSlug = signal<string | null>("");
  isLoading = signal<boolean>(false);
  product = signal<Product>({
    id: "",
    name: {
      normal: "",
      slug: ""
    },
    description: "",
    price: 0,
    rating: 0,
    inCategory: {
      id: "",
      name: {
        normal: "",
        slug: ""
      }
    }
  });
  reviews_section = signal<{ pagination: Pagination; reviews: Array<Review> }>({
    pagination: {
      currentPage: 1,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0
    },
    reviews: []
  });

  reviewInput = {
    rating: 3,
    message: ""
  }

  

  constructor(private router: Router, private route: ActivatedRoute, private cafeService: CafeService) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categorySlug.set(params.get("categoryslug"));
      this.itemSlug.set(params.get("itemslug"));
      this.loadProduct();
    });
    
  }

  loadProduct(): void {
    this.isLoading.set(true); 
    this.cafeService.getProduct(this.categorySlug()!, this.itemSlug()!, this.reviews_section().pagination.currentPage, this.reviews_section().pagination.pageSize).subscribe({
      next: (response) => {
        this.product.set(response.data.product);
        this.reviews_section.set(response.data.reviews_section);
        this.isLoading.set(false);
        console.log(response.data);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
    
  }

   /**
   * Föregående menysida.
   */
  previous(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === 1 ? total : current - 1;

    this.reviews_section().pagination.currentPage = newPage;
    this.loadProduct();
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === total ? 1 : current + 1;

     this.reviews_section().pagination.currentPage = newPage;
    this.loadProduct();
  }

  setAVGRating(rating: number): string {
    let r = Math.round(rating * 100) / 100;

    if (r % 1 === 0 ) {
      return `${r}.0`;
    }
    return String(r);
  }

  postReview(): void {
    console.log(this.reviewInput);
  }

  deleteReview(): void {

  }

}
