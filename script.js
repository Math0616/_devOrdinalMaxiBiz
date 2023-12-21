document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetch('images.json').then(response => response.json()),
        fetch('tokens.json').then(response => response.json())
    ])
    .then(([imagesData, tokensData]) => {
        const mergedData = mergeData(imagesData, tokensData);
        createGallery(mergedData);
		setupFilterEventListeners(); // Setup event listeners for filters
    })
    .catch(error => console.error('Error loading data:', error));

});

function mergeData(imagesData, tokensData) {
    const tokensMap = new Map(tokensData.map(token => [token.id, token]));
    return imagesData.map(image => {
        const token = tokensMap.get(image.id);
        return token ? { ...image, ...token } : image;
    });
}

function createGallery(mergedData) {
    // Sort mergedData by listedPrice, and then by the second number if listedPrice is undefined or not present
    mergedData.sort((a, b) => {
        let aPrice = a.listedPrice !== 'undefined' && a.listedPrice !== undefined ? parseFloat(a.listedPrice) : Infinity;
        let bPrice = b.listedPrice !== 'undefined' && b.listedPrice !== undefined ? parseFloat(b.listedPrice) : Infinity;

        if (aPrice === Infinity && bPrice === Infinity) {
            // Extract the second number if it exists, otherwise use the first/only number
            let aNumber = extractSecondNumber(a.number);
            let bNumber = extractSecondNumber(b.number);

            return aNumber - bNumber;
        } else {
            // Sort by price when available
            return aPrice - bPrice;
        }
    });

    const gallery = document.querySelector('.gallery');
    mergedData.forEach(image => {
	const imageUrl = `https://ord-mirror.magiceden.dev/content/${image.id}`;

	// Create gallery item container
	const galleryItem = document.createElement('div');
	galleryItem.classList.add('gallery-item');

	// Setting the 'number' data attribute
	galleryItem.dataset.number = Array.isArray(image.number) ? image.number.join(', ') : image.number.toString();

	// Set the listedPrice data attribute, even if it's undefined
	galleryItem.dataset.listedPrice = image.listedPrice;
	galleryItem.dataset.id = image.id;

	// Set eyeColor and other optional attributes as data attributes
	const attributes = ['eyeColor', 'Female', 'Hat', 'Speaking', 'Smoking', 'NoFace', 'Demon', 'ThreePlusEyes', 'Lines', 'Earphone', 'Music', 'Hands', 'Ghost', 'Emoji', 'Crown', 'OneEye', 'Sick', 'Animal', 'Alien', 'Weapon', 'Ape', 'OpenScalp', 'Miner', 'ShadowDAO', 'LFG', 'Clown', 'Hoodie', 'OGHoodies', 'RealRef', 'Fiction', 'FreeRoss', 'Letterhead', 'Glasses', "sunGlasses", "Clean", 'Robot', 'Punk', 'Undead', 'FaceCover', 'GasMask'];
	attributes.forEach(attr => {
		if (image[attr]) {
		galleryItem.dataset[attr] = image[attr];
		}
	});

	// Create link element
	const link = document.createElement('a');
	link.href = `https://magiceden.io/ordinals/item-details/${image.id}`;
	link.target = "_blank";

	// Create image container
	const imageContainer = document.createElement('div');
	imageContainer.classList.add('image-container');

	// Create and set image element
	const img = document.createElement('img');
	img.dataset.src = imageUrl;
	img.alt = `Ordinal Maxi Biz #${image.id}`;
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
	if (image.listedPrice && image.listedPrice !== 'undefined') {
		const priceTag = document.createElement('div');
		priceTag.classList.add('price-tag');
		priceTag.textContent = `₿${image.listedPrice}`;
		galleryItem.appendChild(priceTag);
	}

	// Append gallery item to gallery
	gallery.appendChild(galleryItem);

	});
	
	initializeLazyLoad(); // After adding all images to the gallery, initialize lazy loading
	updateCount(); // This will update the count when the page loads

    // Ensure that the checkbox elements are being selected properly.
    var checkboxes = document.querySelectorAll('.filter-dropdown input[type="checkbox"]');

    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            updateFilterButtonText(); // Call the update function
        });
    });

    function updateFilterButtonText() {
        var selectedFilters = [];

        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                // Use the 'id' of the checkbox to find the associated label
                var labelSelector = "label[for='" + checkbox.id + "']";
                var label = document.querySelector(labelSelector);

                if (label) {
                    selectedFilters.push(label.textContent.trim());
                } else {
                    console.log('Label not found for checkbox:', checkbox.id); // Debugging: Log if the label is not found
                }
            }
        });

        var filterButton = document.getElementById('filter-button');
        if (filterButton) {
            filterButton.textContent = selectedFilters.length > 0 ? 'Filters: ' + selectedFilters.join(', ') : 'Traits Filter';
        } else {
            console.log('Filter button not found'); // Debugging: Log if the filter button is not found
        }
    }
}

function extractSecondNumber(numberData) {
    // Ensure numberData is a string
    let numberString = String(numberData);

    // Split the number string by commas and trim each part
    let numbers = numberString.split(',').map(n => n.trim());

    // Use the second number if available, otherwise the first
    return numbers.length > 1 ? parseInt(numbers[1], 10) : parseInt(numbers[0], 10);
}

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

function setupFilterEventListeners() {
    // Event listeners for existing attribute filters
    document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterGallery);
    });

    // Event listener for the listedPrice filter
    document.getElementById('filter-listedPrice').addEventListener('change', filterGallery);
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
  
	// Get the bounding rectangle of the image
    const imgRect = event.target.getBoundingClientRect();

    // Position the tooltip at the top left corner of the image
    tooltip.style.left = `${imgRect.left + window.scrollX}px`;
    tooltip.style.top = `${imgRect.top + window.scrollY}px`;
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
    let tooltipContent = '';
    let hasSpecialTraits = false;

    for (const attr in image) {
        if (image.hasOwnProperty(attr) && image[attr] === true) {
            tooltipContent += `${attr}\n`; // Each attribute name on a new line
            hasSpecialTraits = true;
        }
    }

    // If no special traits are found, display "No Special Traits"
    if (!hasSpecialTraits) {
        tooltipContent = 'No Special Traits';
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

    const gallery = document.querySelector('.gallery');
    let galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const checkedAttributes = Array.from(document.querySelectorAll('.filter-dropdown input[type="checkbox"]:not([name="eyeColor"], [name="no-trait"])'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.name);
    const checkedEyeColors = Array.from(document.querySelectorAll('.filter-dropdown input[type="checkbox"][name="eyeColor"]:checked'))
        .map(checkbox => checkbox.value);
    const isNoTraitChecked = document.getElementById('no-trait').checked;
    const isListedPriceChecked = document.getElementById('filter-listedPrice').checked;

    // Apply filters first
    galleryItems.forEach(item => {
        const matchesEyeColor = checkedEyeColors.length === 0 || checkedEyeColors.includes(item.dataset.eyeColor);
        let shouldDisplay = matchesEyeColor;

        if (isNoTraitChecked) {
            const attributeCount = Object.keys(item.dataset).length;
            shouldDisplay = shouldDisplay && (attributeCount === 3 || (attributeCount === 4 && item.dataset.listedPrice)); // Assumes id, eyeColor, number, and optionally listedPrice are the only attributes
        } else if (checkedAttributes.length > 0) {
            shouldDisplay = shouldDisplay && checkedAttributes.every(attr => item.dataset[attr] === 'true');
        }

        if (isListedPriceChecked) {
            shouldDisplay = shouldDisplay && item.dataset.listedPrice && item.dataset.listedPrice !== 'undefined';
        }

        item.style.display = shouldDisplay ? 'block' : 'none';
    });

    updateCount();
}

// Call filterGallery when the listed price checkbox changes
document.getElementById('filter-listedPrice').addEventListener('change', filterGallery);

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
