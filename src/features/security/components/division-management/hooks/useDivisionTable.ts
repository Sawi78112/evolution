import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDivisions } from '../../../hooks/useDivisions';
import { useNotification } from '@/components/ui/notification';
import { SortField } from '../types';
import { DivisionFormData } from '../AddDivisionModal';
import { calculateDropdownPosition } from '../../../utils/positioning';

export function useDivisionTable() {
  // Core table state
  const [currentParams, setCurrentParams] = useState({
    page: 1,
    limit: 5,
    search: '',
    sortField: 'createdAt',
    sortDirection: 'desc' as 'asc' | 'desc'
  });

  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook for divisions data - using the working API
  const { 
    divisions, 
    pagination, 
    filters, 
    sorting, 
    loading, 
    error, 
    refetch, 
    goToPage, 
    changeLimit, 
    search, 
    filterByStatus, 
    sort 
  } = useDivisions(currentParams);
  
  // Notification hook
  const notification = useNotification();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [selectedDivisionForDelete, setSelectedDivisionForDelete] = useState<{id: string, name: string} | null>(null);
  const [deletingDivision, setDeletingDivision] = useState(false);

  // Status popover state
  const [openStatusPopover, setOpenStatusPopover] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });

  // Refs for click outside handling
  const statusPopoverRef = useClickOutside(() => setOpenStatusPopover(null));

  // Sort handler
  const requestSort = (field: SortField) => {
    const newDirection: 'asc' | 'desc' = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, sortField: field, sortDirection: newDirection, page: 1 };
    setCurrentParams(newParams);
    sort(field, newDirection);
  };

  // Debounced search function
  const performSearch = (searchTerm: string) => {
    const newParams = { ...currentParams, search: searchTerm.trim(), page: 1 };
    setCurrentParams(newParams);
    search(searchTerm.trim());
  };

  // Search handlers
  const handleExplicitSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExplicitSearch();
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchInput(term);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search immediately when input is cleared (empty)
    if (term === '') {
      performSearch('');
    }
    // Remove the automatic debounced search - user must click search icon or press Enter
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    const newParams = { ...currentParams, page };
    setCurrentParams(newParams);
    goToPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    const newParams = { ...currentParams, limit: items, page: 1 };
    setCurrentParams(newParams);
    changeLimit(items);
  };

  // Status change handler
  const handleStatusChange = async (divisionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/divisions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          divisionId,
          status: newStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Update local state
      setSelectedStatuses(prev => ({
        ...prev,
        [divisionId]: newStatus
      }));

      // Refresh the data
      refetch();
      
      notification.success(
        'Status Updated',
        `Division status has been updated to ${newStatus}.`
      );
    } catch (error) {
      notification.error(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update status'
      );
    }
  };

  // Toggle status popover
  const toggleStatusPopover = (divisionId: string, e: React.MouseEvent) => {
    if (openStatusPopover === divisionId) {
      setOpenStatusPopover(null);
    } else {
      const targetElement = e.currentTarget as HTMLElement;
      const position = calculateDropdownPosition(targetElement, 200);
      
      setStatusDropdownPosition(position.direction);
      setClickCoordinates({ x: position.x, y: position.y });
      setOpenStatusPopover(divisionId);
    }
  };

  // Modal handlers
  const handleAddDivision = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDivision(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedDivisionForDelete(null);
  };

  const handleModalSubmit = (divisionData: DivisionFormData) => {
    console.log('Adding division:', divisionData);
    // Handle form submission
  };

  const handleEditModalSubmit = (divisionData: DivisionFormData) => {
    console.log('Editing division:', divisionData);
    // Handle edit submission
  };

  const handleEditDivision = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    if (division) {
      setSelectedDivision(division);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteDivision = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    if (division) {
      setSelectedDivisionForDelete({
        id: division.id,
        name: division.name
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDivisionForDelete) return;

    setDeletingDivision(true);

    try {
      const response = await fetch('/api/divisions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          divisionId: selectedDivisionForDelete.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete division');
      }

      refetch();
      
      notification.success(
        'Division Deleted',
        `"${selectedDivisionForDelete.name}" has been successfully deleted.`
      );
      
      console.log('Division deleted successfully:', result.message);
      handleDeleteModalClose();
    } catch (error) {
      notification.error(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete division'
      );
      console.error('Failed to delete division:', error);
    } finally {
      setDeletingDivision(false);
    }
  };

  return {
    // Data
    divisions,
    pagination,
    filters,
    sorting,
    loading,
    error,
    
    // Search
    searchInput,
    currentParams,
    
    // Handlers
    requestSort,
    handleExplicitSearch,
    handleSearchKeyPress,
    handleSearchChange,
    handlePageChange,
    handleItemsPerPageChange,
    handleAddDivision,
    handleEditDivision,
    handleDeleteDivision,
    handleStatusChange,
    toggleStatusPopover,
    refetch,
    
    // Modal state
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedDivision,
    selectedDivisionForDelete,
    deletingDivision,
    handleModalClose,
    handleEditModalClose,
    handleDeleteModalClose,
    handleModalSubmit,
    handleEditModalSubmit,
    handleConfirmDelete,
    
    // Status popover state
    openStatusPopover,
    selectedStatuses,
    statusDropdownPosition,
    clickCoordinates,
    statusPopoverRef
  };
} 