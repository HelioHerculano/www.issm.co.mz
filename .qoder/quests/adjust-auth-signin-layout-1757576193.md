# ISSM Portal - Auth SignIn Layout Adjustment

## Overview

This design document outlines the layout adjustments needed for the ISSM Portal authentication sign-in page (`entidades/auth-signin.html`). The current layout will be modified to position the login form on the left side and add an insurance policy verification-themed image or illustration on the right side, creating a more balanced and contextually relevant user interface.

## Current Layout Analysis

The existing auth-signin page uses a responsive layout with:
- Login form positioned in a centered column (`col-lg-6`)
- Right side placeholder with a generic image (`img-10.jpg`)
- Bootstrap grid system with `col-xxl-7` for form area and `col-xxl-5` for image area

## Layout Requirements

### Left Side - Login Form Area
- **Position**: Left side of the screen (maintain current responsive behavior)
- **Content**: Existing authentication form with ISSM branding
- **Width**: Maintain current `col-xxl-7` responsive column
- **Styling**: Preserve existing ISSM portal styling and validation

### Right Side - Insurance Verification Illustration
- **Position**: Right side of the screen
- **Content**: Insurance policy verification themed image/illustration
- **Context**: Visual representation of insurance policy verification process
- **Width**: Maintain current `col-xxl-5` responsive column
- **Responsive**: Hidden on screens smaller than `xxl` (as currently implemented)

## Visual Design Specifications

### Image/Illustration Requirements
The right side should feature an image or illustration that represents:
1. **Insurance Policy Verification**: Visual elements showing policy documents, verification stamps, or digital verification process
2. **ISSM Branding**: Incorporate ISSM color scheme and visual identity
3. **Professional Context**: Business-oriented imagery suitable for an institutional portal
4. **Mozambique Context**: If possible, include elements relevant to the Mozambican insurance market

### Suggested Visual Elements
- Insurance policy documents with verification badges
- Digital verification workflow illustration
- Professional business imagery with ISSM brand colors
- Icons representing security, trust, and verification
- Modern, clean illustration style matching ISSM portal design

## Layout Structure

``mermaid
graph LR
    subgraph "Auth SignIn Layout"
        A[Left Side - Login Form<br/>col-xxl-7] 
        B[Right Side - Insurance Illustration<br/>col-xxl-5]
    end
    
    subgraph "Left Content"
        C[ISSM Logo]
        D[Login Form]
        E[Email Input]
        F[Password Input]
        G[Remember Me]
        H[Submit Button]
        I[Registration Link]
    end
    
    subgraph "Right Content"
        J[Insurance Verification<br/>Themed Image]
        K[Policy Documents Icon]
        L[Verification Badge]
        M[Professional Context]
    end
    
    A --> C
    A --> D
    D --> E
    D --> F
    D --> G
    D --> H
    A --> I
    B --> J
    J --> K
    J --> L
    J --> M
```

## Implementation Specifications

### HTML Structure Adjustments
The current HTML structure is already properly organized for the desired layout:

```html
<div class="row h-100">
    <div class="col-xxl-7">
        <!-- Left side - Login form (already correctly positioned) -->
        <div class="row justify-content-center h-100">
            <div class="col-lg-6 py-lg-5">
                <!-- Authentication form content -->
            </div>
        </div>
    </div>
    
    <div class="col-xxl-5 d-none d-xxl-flex">
        <!-- Right side - Insurance verification image -->
        <div class="card h-100 mb-0 overflow-hidden">
            <div class="d-flex flex-column h-100">
                <!-- NEW: Insurance verification themed image -->
                <img src="path/to/insurance-verification-image.jpg" 
                     alt="Verificação de Apólices de Seguros - ISSM" 
                     class="w-100 h-100 object-fit-cover">
            </div>
        </div>
    </div>
</div>
```

### Image Requirements
- **Format**: JPG, PNG, or SVG
- **Dimensions**: Minimum 800x600px for quality display
- **Aspect Ratio**: Flexible to fill container height
- **File Size**: Optimized for web (under 500KB)
- **Alt Text**: Portuguese description for accessibility

### CSS Considerations
- Maintain existing responsive behavior
- Preserve ISSM portal styling classes
- Ensure image scales properly with `object-fit-cover`
- Keep consistent with current design system

## Responsive Design

### Breakpoint Behavior
- **XL and above (≥1400px)**: Two-column layout with form left, image right
- **Large to XL (992px - 1399px)**: Form only, image hidden
- **Medium and below (<992px)**: Mobile-optimized form layout

### Mobile Experience
- Login form remains centered and accessible
- Insurance verification image hidden on smaller screens
- Touch-friendly form inputs and buttons
- Proper viewport scaling maintained

## Accessibility Requirements

### Image Accessibility
- **Alt Text**: "Verificação de Apólices de Seguros - ISSM"
- **ARIA Labels**: Appropriate labeling for screen readers
- **Context**: Image should not convey critical information (decorative)

### Form Accessibility
- Maintain existing ARIA labels and form validation
- Preserve keyboard navigation support
- Keep existing screen reader compatibility

## Technical Implementation

### File Updates Required
1. **HTML File**: `entidades/auth-signin.html`
   - Update image source path
   - Modify alt text for new image
   - No structural changes needed

2. **Image Asset**: Add new insurance verification themed image
   - Location: `assets/images/auth/`
   - Filename: `insurance-verification-illustration.jpg`

3. **CSS**: No additional styles required
   - Existing responsive classes handle layout
   - Current styling supports the desired arrangement

### Validation Requirements
- Ensure new image loads properly across all supported browsers
- Test responsive behavior on various screen sizes
- Verify accessibility compliance with screen readers
- Confirm loading performance impact

## Content Guidelines

### Image Content Should Include
- Visual representation of insurance policy documents
- Verification or approval symbols (checkmarks, stamps)
- Professional, institutional aesthetic
- Clean, modern design style
- Subtle ISSM brand color integration

### Image Content Should Avoid
- Overly complex or distracting elements
- Text that requires translation
- Cultural or regional specificity that might exclude users
- Dark or low-contrast imagery that affects form readability

## Testing Requirements

### Functional Testing
- Verify form functionality remains unchanged
- Test responsive layout on various devices
- Confirm image loading and display quality
- Validate accessibility with screen readers

### Visual Testing
- Cross-browser compatibility testing
- Mobile device layout verification
- Image quality and scaling validation
- Brand consistency review

### Performance Testing
- Page load time impact assessment
- Image optimization verification
- Mobile network performance testing
