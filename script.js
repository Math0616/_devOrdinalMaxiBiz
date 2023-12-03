document.addEventListener('DOMContentLoaded', function() {
	fetch('images.json')
	.then(response => response.json())
	.then(data => {
		const gallery = document.querySelector('.gallery');
		data.forEach(image => {
		const imageUrl = `https://ord-mirror.magiceden.dev/content/${image.tokenId}`;

		// Create gallery item container
		const galleryItem = document.createElement('div');
		galleryItem.classList.add('gallery-item');

		// Setting the 'number' data attribute
		galleryItem.dataset.number = Array.isArray(image.number) ? image.number.join(', ') : image.number.toString();

		// Set eyeColor and other optional attributes as data attributes
		const attributes = ['eyeColor', 'female', 'hat', 'speaking', 'smoking', 'noFace', 'demon', 'threePlusEye', 'lines', 'earphone', 'music', 'hands', 'ghost', 'emoji', 'crown', 'oneEye', 'sick', 'animal', 'alien', 'weapon', 'ape', 'openScalp', 'miner', 'shadow', 'lfg', 'clown', 'hoodie', 'OGHoodies', 'realRef', 'fiction', 'freeRoss', 'letterhead', 'glasses', 'robot', 'punk', 'undead', 'faceCover', 'gasMask'];
		attributes.forEach(attr => {
			if (image[attr]) {
			galleryItem.dataset[attr] = image[attr];
			}
		});

		// Create link element
		const link = document.createElement('a');
		link.href = `https://magiceden.io/ordinals/item-details/${image.tokenId}`;
		link.target = "_blank";

		// Create image container
		const imageContainer = document.createElement('div');
		imageContainer.classList.add('image-container');

		// Create and set image element
		const img = document.createElement('img');
		img.dataset.src = imageUrl;
		img.alt = `Ordinal Maxi Biz #${image.tokenId}`;
		img.classList.add('lazyload');

		let hoverTimeout; // Variable to store the hover state timeout

		// Add mouseover event listener with a delay for the tooltip
		img.addEventListener('mouseover', function(event) {
			hoverTimeout = setTimeout(function() {
				showTooltip(event, image);
			}, 1000); // Delay of 1 second
		});

		// Add mouseout event listener to hide tooltip and clear the hover timeout
		img.addEventListener('mouseout', function() {
			clearTimeout(hoverTimeout);
			hideTooltip();
		});

		// Append image to its container
		imageContainer.appendChild(img);

		// Append image container to link
		link.appendChild(imageContainer);

		// Append link to gallery item
		galleryItem.appendChild(link);

		// Price tag with Bitcoin symbol
		if (image.price) {
			const priceTag = document.createElement('div');
			priceTag.classList.add('price-tag');
			priceTag.textContent = `₿${image.price}`;
			galleryItem.appendChild(priceTag);
		}

		// Append gallery item to gallery
		gallery.appendChild(galleryItem);
		});
		
		initializeLazyLoad(); // After adding all images to the gallery, initialize lazy loading
		updateCount(); // This will update the count when the page loads
	})
	.catch(error => console.error('Error loading image data:', error));
});  

function initializeLazyLoad() {
const lazyImages = document.querySelectorAll('img.lazyload');
const imageObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
	if (entry.isIntersecting) {
		const img = entry.target;
		img.src = img.getAttribute('data-src');
		img.classList.remove('lazyload');
		observer.unobserve(entry.target);
	}
	});
});

lazyImages.forEach(img => {
	imageObserver.observe(img);
});
}

function updateCount() {
	// Select all the gallery items
	const galleryItems = document.querySelectorAll('.gallery-item');
	// Use Array.prototype.filter to count the items that are currently visible
	const count = Array.from(galleryItems).filter(item => item.style.display !== 'none').length;
	// Update the display with the new count. You will need an element in your HTML to show the count.
	const countDisplay = document.getElementById('count-display');
	if (countDisplay) {
	countDisplay.textContent = `${count} OMBs`;
	}
}

document.addEventListener('DOMContentLoaded', function() {
    const filterButton = document.getElementById('filter-button');
    const filterOptions = document.getElementById('filter-options');
    const dropdownContainer = document.querySelector('.filter-dropdown'); // Container for both the button and the dropdown
    
    // Function to show dropdown
    function showDropdown() {
        filterOptions.classList.add('show');
    }

    // Function to hide dropdown
    function hideDropdown() {
        filterOptions.classList.remove('show');
    }

    // Function to toggle dropdown for small screens
    function toggleDropdown(event) {
        if (window.matchMedia("(max-width: 700px)").matches) {
            event.stopPropagation(); // Prevents the click from immediately closing the dropdown
            filterOptions.classList.toggle('show');
        }
    }

    // Function to close dropdown when clicking outside
    function closeDropdown(event) {
        if (!dropdownContainer.contains(event.target)) {
            filterOptions.classList.remove('show');
        }
    }

    // Apply the appropriate event handlers based on screen size
    if (window.matchMedia("(max-width: 700px)").matches) {
        filterButton.addEventListener('click', toggleDropdown); // For small screens
        document.addEventListener('click', closeDropdown); // Close dropdown when clicking outside
    } else {
        dropdownContainer.addEventListener('mouseover', showDropdown); // For non-small screens
        dropdownContainer.addEventListener('mouseout', hideDropdown); // Hide dropdown when mouse leaves the dropdown area
    }

    // Prevent clicks within the dropdown from closing it
    filterOptions.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

// Function to show the tooltip
function showTooltip(event, image) {
	const tooltip = document.createElement('div');
	tooltip.className = 'tooltip';
	tooltip.textContent = createTooltipContent(image); // Use the same createTooltipContent function from above
	document.body.appendChild(tooltip);
  
	// Position the tooltip
	const rect = event.target.getBoundingClientRect();
	tooltip.style.left = `${rect.left + window.scrollX}px`;
	tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`; // 10px below the image
	tooltip.style.display = 'block';
  }
  
// Function to hide the tooltip
function hideTooltip() {
	const tooltip = document.querySelector('.tooltip');
	if (tooltip) {
	tooltip.remove();
	}
}

function createTooltipContent(image) {
	let tooltipContent = 'Attributes:\n';
	for (const attr in image) {
		if (image.hasOwnProperty(attr) && attr !== 'tokenId' && attr !== 'number') {
			tooltipContent += `${attr}: ${image[attr]}\n`;
		}
	}
	return tooltipContent.trim();
}

// Add event listeners to checkboxes
document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(checkbox => {
	checkbox.addEventListener('change', filterGallery);
});

function filterGallery() {
	// Ignore filtering if there's a search term
	if (document.getElementById('search-bar').value.trim()) {
        return; 
    }

	const checkedAttributes = Array.from(document.querySelectorAll('.filter-dropdown input[type="checkbox"]:not([name="eyeColor"], [name="no-trait"])'))
		.filter(checkbox => checkbox.checked)
		.map(checkbox => checkbox.name);
	const checkedEyeColors = Array.from(document.querySelectorAll('.filter-dropdown input[type="checkbox"][name="eyeColor"]:checked'))
		.map(checkbox => checkbox.value);
	const isNoTraitChecked = document.getElementById('no-trait').checked;

	document.querySelectorAll('.gallery-item').forEach(item => {
		const matchesEyeColor = checkedEyeColors.length === 0 || checkedEyeColors.includes(item.dataset.eyeColor);

		// Start with shouldDisplay set to the result of matchesEyeColor
		let shouldDisplay = matchesEyeColor;

		if (isNoTraitChecked) {
			// If "No Trait" is checked, count the attributes and check if only eyeColor is present
			const attributeCount = Object.keys(item.dataset).length;
			shouldDisplay = shouldDisplay && (attributeCount === 2); // This assumes eyeColor and number are the only attributes
		} else if (checkedAttributes.length > 0) {
			// If other attribute filters are checked, ensure they all match
			shouldDisplay = shouldDisplay && checkedAttributes.every(attr => item.dataset[attr] === 'true');
		}

		// If no filters are checked, shouldDisplay remains true based on the matchesEyeColor result
		item.style.display = shouldDisplay ? 'block' : 'none';
	});

	updateCount(); // Call updateCount after filtering is done to update the display count
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
	// Apply filter when checkboxes change
	document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('change', filterGallery);
	});

	filterGallery(); // Initial call to filterGallery to apply the default state
});

function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

function searchGallery() {
    const searchTerm = document.getElementById('search-bar').value.trim();
    document.querySelectorAll('.gallery-item').forEach(item => {
        // Split the numbers by comma and trim whitespace, then check if any matches the searchTerm exactly
        const numbers = item.dataset.number.split(',').map(n => n.trim());
        const match = numbers.some(number => number === searchTerm);
        item.style.display = match ? 'block' : 'none';
    });

    // If the search bar is cleared, return to the previous filter state
    if (!searchTerm) {
        filterGallery();
    }

}

document.getElementById('search-bar').addEventListener('input', debounce(searchGallery, 500));
